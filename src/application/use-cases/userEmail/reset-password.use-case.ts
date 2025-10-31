import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  Inject,
} from "@nestjs/common";
import { UserEmailRepository } from "@/domain/repositories/user-email.repository";
import { UserEmail } from "@/domain/entities/user-email.entity";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import * as CryptoJS from "crypto-js";
import axios from "axios";

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  private readonly AES_SECRET: string;
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
    this.AES_SECRET = process.env.AES_SECRET ?? "";
    this.tenantId = process.env.AZURE_TENANT_ID ?? "";
    this.clientId = process.env.AZURE_CLIENT_ID ?? "";
    this.clientSecret = process.env.AZURE_CLIENT_SECRET ?? "";

    this.validateEnv();
  }

  private validateEnv(): void {
    const missing = [];
    if (!this.AES_SECRET) missing.push("AES_SECRET");
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

  private encryptPassword(password: string): string {
    if (!this.AES_SECRET)
      throw new InternalServerErrorException("AES_SECRET not configured");
    return CryptoJS.AES.encrypt(password, this.AES_SECRET).toString();
  }

  private async updateMicrosoftPassword(
    token: string,
    upn: string,
    newPassword: string
  ): Promise<void> {
    const url = `${this.graphEndpoint}/${encodeURIComponent(upn)}`;
    const body = {
      passwordProfile: {
        forceChangePasswordNextSignIn: false,
        password: newPassword,
      },
    };

    const res = await axios.patch(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
      validateStatus: () => true,
    });

    if (res.status >= 400) {
      this.logger.error(
        `❌ Failed to update password for ${upn} (${res.status})`,
        res.data
      );
      throw new BadRequestException({
        message: "Failed to update Microsoft 365 password",
        status: res.status,
        graphError: res.data,
      });
    }

    this.logger.log(`✅ Microsoft 365 password updated for ${upn}`);
  }

  async execute(
    userId: string,
    newPassword: string
  ): Promise<{ upn: string; message: string }> {
    if (!newPassword || newPassword.length < 8)
      throw new BadRequestException(
        "A valid new password (8+ chars) is required"
      );

    let userEmail = await this.repo.findByUserId(userId);

    if (!userEmail) {
      const prismaEmail = await this.prisma.userEmail.findUnique({
        where: { userId },
      });
      if (!prismaEmail)
        throw new NotFoundException(
          `No professional email found for user ${userId}`
        );

      userEmail = new UserEmail(
        prismaEmail.id,
        prismaEmail.userId,
        prismaEmail.upn,
        prismaEmail.password,
        prismaEmail.displayName,
        prismaEmail.alias,
        prismaEmail.licenseSku
      );
    }

    const token = await this.obtainGraphAccessToken();

    // 🔐 Update password on Microsoft 365
    await this.updateMicrosoftPassword(token, userEmail.upn, newPassword);

    // 🔒 Encrypt and store new password locally
    const encryptedPassword = this.encryptPassword(newPassword);
    await this.prisma.userEmail.update({
      where: { id: userEmail.id },
      data: { password: encryptedPassword },
    });

    this.logger.log(`✅ Password reset for user ${userId} (${userEmail.upn})`);

    return {
      upn: userEmail.upn,
      message: "Password updated successfully in Microsoft 365 and local DB",
    };
  }
}
