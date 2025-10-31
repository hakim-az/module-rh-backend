import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { AccesRepository } from "@/domain/repositories/acces.repository";
import { UpdateAccesDto } from "@/application/dtos/acces.dto";
import { Acces } from "@/domain/entities/acces.entity";
import * as CryptoJS from "crypto-js";

@Injectable()
export class UpdateAccesUseCase {
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

  async execute(id: string, dto: UpdateAccesDto): Promise<Acces> {
    // 1️⃣ Find the existing Acces
    const existingAcces = await this.accesRepo.findById(id);
    if (!existingAcces) {
      throw new NotFoundException(`Acces with id ${id} not found`);
    }

    // 2️⃣ Update fields if provided
    if (dto.password !== undefined) {
      existingAcces.password = dto.password
        ? this.encryptPassword(dto.password)
        : null;
    }

    if (dto.email !== undefined) {
      existingAcces.email = dto.email ?? null;
    }

    if (dto.status !== undefined) {
      existingAcces.status = dto.status;
    }

    if (dto.productCode !== undefined) {
      existingAcces.productCode = dto.productCode;
    }

    // 3️⃣ Save updated Acces
    return this.accesRepo.update(id, existingAcces);
  }
}
