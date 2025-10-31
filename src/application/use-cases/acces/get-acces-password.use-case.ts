import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { AccesRepository } from "@/domain/repositories/acces.repository";
import * as CryptoJS from "crypto-js";

@Injectable()
export class GetAccesPasswordUseCase {
  private readonly AES_SECRET: string;

  constructor(
    @Inject(AccesRepository)
    private readonly accesRepo: AccesRepository
  ) {
    this.AES_SECRET = process.env.AES_SECRET ?? "";
    if (!this.AES_SECRET) {
      throw new InternalServerErrorException("AES_SECRET is not configured");
    }
  }

  private decryptPassword(encryptedPassword: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, this.AES_SECRET);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      throw new InternalServerErrorException("Failed to decrypt password");
    }
  }

  async execute(userId: string, productCode: string): Promise<string> {
    const acces = await this.accesRepo.findByUserIdAndProductCode(
      userId,
      productCode
    );

    if (!acces) {
      throw new NotFoundException(
        `No access found for user ${userId} and product ${productCode}`
      );
    }

    if (!acces.password) {
      throw new NotFoundException(`No password stored for this access`);
    }

    return this.decryptPassword(acces.password);
  }
}
