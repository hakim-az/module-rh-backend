import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { AccesRepository } from "@/domain/repositories/acces.repository";
import * as CryptoJS from "crypto-js";

@Injectable()
export class ResetAccesPasswordUseCase {
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

  private encryptPassword(password: string): string {
    try {
      return CryptoJS.AES.encrypt(password, this.AES_SECRET).toString();
    } catch (err) {
      throw new InternalServerErrorException("Failed to encrypt password");
    }
  }

  async execute(accesId: string, newPassword: string) {
    const acces = await this.accesRepo.findByAccesId(accesId);

    if (!acces) {
      throw new NotFoundException("Acces not found");
    }

    acces.password = this.encryptPassword(newPassword);

    return this.accesRepo.update(accesId, acces);
  }
}
