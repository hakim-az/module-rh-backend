import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  Inject,
} from "@nestjs/common";
import { UserEmailRepository } from "@/domain/repositories/user-email.repository";
import { UserEmail } from "@/domain/entities/user-email.entity";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import * as CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

@Injectable()
export class CreateUserEmailUseCase {
  private readonly logger = new Logger(CreateUserEmailUseCase.name);

  private readonly AES_SECRET: string;
  private readonly tenantId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly domain: string;
  private readonly graphScope = "https://graph.microsoft.com/.default";
  private readonly graphEndpoint = "https://graph.microsoft.com/v1.0/users";

  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(
    @Inject(UserEmailRepository)
    private readonly userEmailRepository: UserEmailRepository,
    private readonly prisma: PrismaService
  ) {
    this.AES_SECRET = process.env.AES_SECRET ?? "";
    this.tenantId = process.env.AZURE_TENANT_ID ?? "";
    this.clientId = process.env.AZURE_CLIENT_ID ?? "";
    this.clientSecret = process.env.AZURE_CLIENT_SECRET ?? "";
    this.domain = process.env.EMAIL_DOMAIN ?? "finanssor.fr";

    this.validateEnvironmentVariables();
  }

  private validateEnvironmentVariables(): void {
    const missing: string[] = [];
    if (!this.AES_SECRET) missing.push("AES_SECRET");
    if (!this.tenantId) missing.push("AZURE_TENANT_ID");
    if (!this.clientId) missing.push("AZURE_CLIENT_ID");
    if (!this.clientSecret) missing.push("AZURE_CLIENT_SECRET");

    if (missing.length > 0) {
      const errorMsg = `Missing required environment variables: ${missing.join(", ")}`;
      this.logger.error(`❌ ${errorMsg}`);
      throw new InternalServerErrorException(errorMsg);
    }
  }

  private generatePassword(): string {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+{}[]";

    const length = Math.floor(Math.random() * 5) + 12;
    const allChars = lowercase + uppercase + numbers + special;

    let password = [
      lowercase[Math.floor(Math.random() * lowercase.length)],
      uppercase[Math.floor(Math.random() * uppercase.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      special[Math.floor(Math.random() * special.length)],
    ].join("");

    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  private encryptPassword(password: string): string {
    if (!this.AES_SECRET) {
      throw new InternalServerErrorException("AES_SECRET not configured");
    }
    return CryptoJS.AES.encrypt(password, this.AES_SECRET).toString();
  }

  private sanitizeName(name: string): string {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();
  }

  private async generateUpn(
    prenom: string,
    nomDeNaissance: string
  ): Promise<string> {
    if (!prenom || !nomDeNaissance) {
      throw new BadRequestException("First name and last name are required");
    }

    const sanitizedPrenom = this.sanitizeName(prenom);
    const sanitizedNom = this.sanitizeName(nomDeNaissance);
    const base = `${sanitizedPrenom[0]}.${sanitizedNom}`;
    let upn = `${base}@${this.domain}`;
    let counter = 2;

    while (await this.userEmailRepository.findByUpn(upn)) {
      upn = `${base}${counter}@${this.domain}`;
      counter++;
      if (counter > 100) {
        throw new InternalServerErrorException(
          "Unable to generate unique UPN after 100 attempts"
        );
      }
    }

    return upn;
  }

  private async obtainGraphAccessToken(): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 300000) {
      this.logger.debug("Using cached Microsoft Graph token");
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
        `❌ Failed to obtain access token (${res.status}):`,
        JSON.stringify(res.data, null, 2)
      );
      throw new BadRequestException(
        "Failed to authenticate with Microsoft Graph. Check your credentials."
      );
    }

    const expiresIn = res.data.expires_in || 3600;
    this.tokenCache = {
      token: res.data.access_token,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    this.logger.log(
      `✅ Microsoft Graph token obtained (expires in ${expiresIn}s)`
    );
    return res.data.access_token;
  }

  private async createMicrosoft365User(
    token: string,
    userPrincipalName: string,
    displayName: string,
    mailNickname: string,
    password: string
  ): Promise<string> {
    const body = {
      accountEnabled: true,
      displayName,
      mailNickname,
      userPrincipalName,
      passwordProfile: { forceChangePasswordNextSignIn: false, password },
    };

    const res = await axios.post(this.graphEndpoint, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
      validateStatus: () => true,
    });

    if (res.status >= 400) {
      this.logger.error(
        `❌ Microsoft Graph error (${res.status}):`,
        JSON.stringify(res.data, null, 2)
      );
      throw new BadRequestException({
        message: "Microsoft 365 user creation failed",
        status: res.status,
        graphError: res.data,
      });
    }

    this.logger.log(
      `✅ Microsoft 365 user created successfully: ${res.data.id}`
    );
    return res.data.id;
  }

  /** 🧩 Sets a valid usage location for the user (required for license assignment) */
  private async setUsageLocation(
    token: string,
    graphUserId: string,
    location: string = "US"
  ): Promise<void> {
    const url = `https://graph.microsoft.com/v1.0/users/${graphUserId}`;
    const body = { usageLocation: location };

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
        `❌ Failed to set usageLocation for user ${graphUserId} (${res.status}):`,
        JSON.stringify(res.data, null, 2)
      );
      throw new BadRequestException({
        message: "Failed to set usageLocation for user",
        status: res.status,
        graphError: res.data,
      });
    }

    this.logger.log(
      `✅ usageLocation set to '${location}' for user ${graphUserId}`
    );
  }

  /** 🧩 Assigns a Microsoft 365 license to a user */
  private async assignLicenseToUser(
    token: string,
    graphUserId: string,
    licenseSku: string
  ): Promise<void> {
    const url = `https://graph.microsoft.com/v1.0/users/${graphUserId}/assignLicense`;
    const body = {
      addLicenses: [{ skuId: licenseSku }],
      removeLicenses: [],
    };

    this.logger.log(
      `Assigning license ${licenseSku} to user ${graphUserId}...`
    );

    const res = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
      validateStatus: () => true,
    });

    if (res.status >= 400) {
      this.logger.error(
        `❌ License assignment failed (${res.status}):`,
        JSON.stringify(res.data, null, 2)
      );
      throw new BadRequestException({
        message: "License assignment failed",
        status: res.status,
        graphError: res.data,
      });
    }

    this.logger.log(
      `✅ License ${licenseSku} assigned successfully to ${graphUserId}`
    );
  }

  private async deleteMicrosoft365User(
    token: string,
    graphUserId: string
  ): Promise<void> {
    try {
      await axios.delete(
        `${this.graphEndpoint}/${encodeURIComponent(graphUserId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        }
      );
      this.logger.warn(`🔄 Rolled back Microsoft 365 user: ${graphUserId}`);
    } catch (err: any) {
      this.logger.error(
        `⚠️ Failed to rollback Microsoft 365 user ${graphUserId}`,
        err?.response?.data ?? err?.message
      );
    }
  }

  async execute(
    userId: string,
    licenseSku?: string,
    alias?: string
  ): Promise<{ upn: string; password: string; graphUserId: string }> {
    if (!userId || typeof userId !== "string")
      throw new BadRequestException("Valid userId is required");
    if (alias && !/^[a-zA-Z0-9._-]+$/.test(alias))
      throw new BadRequestException(
        "Alias must contain only letters, numbers, dots, underscores, and hyphens"
      );

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User not found: ${userId}`);

    const existingEmail = await this.userEmailRepository.findByUserId(userId);
    if (existingEmail)
      throw new BadRequestException(
        "User already has a professional email address"
      );

    const upn = await this.generateUpn(user.prenom, user.nomDeNaissance);
    const plainPassword = this.generatePassword();
    const displayName = `${user.prenom} ${user.nomUsuel || user.nomDeNaissance}`;
    const mailNickname = alias || upn.split("@")[0];

    this.logger.log(
      `Creating Microsoft 365 account for user ${userId}: ${upn}`
    );

    const token = await this.obtainGraphAccessToken();
    let graphUserId: string;

    try {
      graphUserId = await this.createMicrosoft365User(
        token,
        upn,
        displayName,
        mailNickname,
        plainPassword
      );

      // 🧠 Assign license immediately after user creation
      // ⚡ Set usageLocation before assigning license
      if (licenseSku) {
        await this.setUsageLocation(token, graphUserId, "FR"); // change "FR" to your EU country
        await this.assignLicenseToUser(token, graphUserId, licenseSku);
      }
    } catch (error) {
      this.logger.error(
        "❌ Microsoft 365 user creation or license assignment failed - rolling back"
      );
      if (graphUserId) await this.deleteMicrosoft365User(token, graphUserId);
      throw error;
    }

    const encryptedPassword = this.encryptPassword(plainPassword);
    const userEmail = new UserEmail(
      uuidv4(),
      userId,
      upn,
      encryptedPassword,
      displayName,
      alias,
      licenseSku
    );

    try {
      await this.userEmailRepository.save(userEmail);
      this.logger.log(
        `✅ User email saved to database: ${upn} for user ${userId}`
      );
    } catch (err: any) {
      this.logger.error(
        "❌ Failed to save user email to database - rolling back Microsoft 365 user",
        err.message
      );
      await this.deleteMicrosoft365User(token, graphUserId);
      throw new InternalServerErrorException(
        "Failed to persist user email locally after Microsoft 365 creation."
      );
    }

    this.logger.log(
      `✅ Successfully created Microsoft 365 account for user ${userId}: ${upn}`
    );
    return { upn, password: plainPassword, graphUserId };
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await this.obtainGraphAccessToken();
      return true;
    } catch (error) {
      this.logger.error("❌ Microsoft Graph credentials validation failed");
      return false;
    }
  }
}
