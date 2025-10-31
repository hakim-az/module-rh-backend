import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  Inject,
} from "@nestjs/common";
import { UserEmailRepository } from "@/domain/repositories/user-email.repository";
import * as CryptoJS from "crypto-js";

@Injectable()
export class GetUserEmailUseCase {
  private readonly logger = new Logger(GetUserEmailUseCase.name);
  private readonly AES_SECRET: string;

  constructor(
    @Inject(UserEmailRepository)
    private readonly repo: UserEmailRepository
  ) {
    this.AES_SECRET = process.env.AES_SECRET ?? "";

    if (!this.AES_SECRET) {
      const errorMsg = "AES_SECRET environment variable is not configured";
      this.logger.error(`❌ ${errorMsg}`);
      throw new InternalServerErrorException(errorMsg);
    }
  }

  private decryptPassword(encryptedPassword: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, this.AES_SECRET);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error("Decryption resulted in empty string");
      }

      return decrypted;
    } catch (error: any) {
      this.logger.error("❌ Failed to decrypt password:", error.message);
      throw new InternalServerErrorException("Failed to decrypt password");
    }
  }

  async execute(userId: string): Promise<{
    id: string;
    userId: string;
    upn: string;
    password: string;
    displayName: string;
    alias?: string;
    licenseSku?: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    if (!userId || typeof userId !== "string") {
      throw new NotFoundException("Valid userId is required");
    }

    this.logger.log(`Retrieving email credentials for user: ${userId}`);

    // Retrieve user email from database
    const userEmail = await this.repo.findByUserId(userId);

    if (!userEmail) {
      this.logger.warn(`⚠️ No email account found for user: ${userId}`);
      throw new NotFoundException(
        `No professional email account found for user: ${userId}`
      );
    }

    // Decrypt password
    const decryptedPassword = this.decryptPassword(userEmail.password);

    this.logger.log(
      `✅ Retrieved email credentials for user: ${userId} (${userEmail.upn})`
    );

    return {
      id: userEmail.id,
      userId: userEmail.userId,
      upn: userEmail.upn,
      password: decryptedPassword,
      displayName: userEmail.displayName,
      alias: userEmail.alias,
      licenseSku: userEmail.licenseSku,
      createdAt: userEmail.createdAt,
      updatedAt: userEmail.updatedAt,
    };
  }
}
