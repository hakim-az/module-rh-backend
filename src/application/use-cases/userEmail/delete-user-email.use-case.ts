import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  Inject,
} from "@nestjs/common";
import { UserEmailRepository } from "@/domain/repositories/user-email.repository";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import axios from "axios";
import { UserEmail } from "@/domain/entities/user-email.entity";

@Injectable()
export class DeleteUserEmailUseCase {
  private readonly logger = new Logger(DeleteUserEmailUseCase.name);

  private readonly tenantId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly graphScope = "https://graph.microsoft.com/.default";
  private readonly graphEndpoint = "https://graph.microsoft.com/v1.0/users";
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(
    @Inject(UserEmailRepository)
    private readonly repo: UserEmailRepository,
    private readonly prisma: PrismaService
  ) {
    this.tenantId = process.env.AZURE_TENANT_ID ?? "";
    this.clientId = process.env.AZURE_CLIENT_ID ?? "";
    this.clientSecret = process.env.AZURE_CLIENT_SECRET ?? "";

    this.validateEnv();
  }

  private validateEnv(): void {
    const missing = [];
    if (!this.tenantId) missing.push("AZURE_TENANT_ID");
    if (!this.clientId) missing.push("AZURE_CLIENT_ID");
    if (!this.clientSecret) missing.push("AZURE_CLIENT_SECRET");

    if (missing.length > 0) {
      const msg = `Missing required environment variables: ${missing.join(", ")}`;
      this.logger.error(msg);
      throw new InternalServerErrorException(msg);
    }
  }

  private async obtainGraphAccessToken(): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 300000) {
      return this.tokenCache.token;
    }

    const url = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "client_credentials",
      scope: this.graphScope,
    });

    const res = await axios.post(url, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 15000,
      validateStatus: () => true,
    });

    if (res.status !== 200 || !res.data?.access_token) {
      this.logger.error(
        `❌ Failed to obtain access token (${res.status})`,
        res.data
      );
      throw new BadRequestException(
        "Failed to authenticate with Microsoft Graph"
      );
    }

    this.tokenCache = {
      token: res.data.access_token,
      expiresAt: Date.now() + (res.data.expires_in || 3600) * 1000,
    };

    return res.data.access_token;
  }

  private async deleteMicrosoftUser(upn: string, token: string): Promise<void> {
    const url = `${this.graphEndpoint}/${encodeURIComponent(upn)}`;

    const res = await axios.delete(url, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000,
      validateStatus: () => true,
    });

    if (res.status === 404) {
      this.logger.warn(`⚠️ Microsoft 365 user not found: ${upn}`);
      return;
    }

    if (res.status >= 400) {
      this.logger.error(
        `❌ Failed to delete Microsoft 365 user ${upn}`,
        res.data
      );
      throw new BadRequestException({
        message: "Failed to delete Microsoft 365 user",
        status: res.status,
        graphError: res.data,
      });
    }

    this.logger.log(`✅ Microsoft 365 user deleted: ${upn}`);
  }

  async execute(userId: string): Promise<{ upn: string; message: string }> {
    if (!userId) throw new BadRequestException("userId is required");

    // 🔍 Try to find userEmail
    let userEmail = await this.repo.findByUserId(userId);

    if (!userEmail) {
      const prismaEmail = await this.prisma.userEmail.findUnique({
        where: { userId },
      });
      if (!prismaEmail)
        throw new NotFoundException(
          `No professional email found for user ${userId}`
        );

      // Convert to entity
      userEmail = new UserEmail(
        prismaEmail.id,
        prismaEmail.userId,
        prismaEmail.upn,
        prismaEmail.password,
        prismaEmail.displayName,
        prismaEmail.alias,
        prismaEmail.licenseSku
      );

      if (prismaEmail.isEnabled === false) userEmail.disable();
      if (prismaEmail.isDeleted) userEmail.softDelete();
    }

    const token = await this.obtainGraphAccessToken();
    const upn = userEmail.upn;

    // 1️⃣ Delete Microsoft 365 account
    await this.deleteMicrosoftUser(upn, token);

    // 2️⃣ Delete locally — check if record still exists
    const existing = await this.prisma.userEmail.findUnique({
      where: { id: userEmail.id },
    });

    if (existing) {
      try {
        await this.repo.delete(userEmail.id);
        this.logger.log(`✅ UserEmail deleted locally for ${userId}`);
      } catch (error: any) {
        if (error.code === "P2025") {
          this.logger.warn(`⚠️ UserEmail already deleted in repo`);
        } else {
          throw error;
        }
      }
    } else {
      this.logger.warn(`⚠️ Local UserEmail record already missing in Prisma`);
    }

    this.logger.log(`✅ User deletion fully completed for ${upn}`);
    return {
      upn,
      message: "User email deleted from Microsoft 365 and local database",
    };
  }
}
