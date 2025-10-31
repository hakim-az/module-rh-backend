import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { AccesRepository } from "@/domain/repositories/acces.repository";
import { CreateAccesDto } from "@/application/dtos/acces.dto";
import { Acces } from "@/domain/entities/acces.entity";
import { v4 as uuidv4 } from "uuid";
import * as CryptoJS from "crypto-js";

@Injectable()
export class CreateAccesUseCase {
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

  async execute(dto: CreateAccesDto): Promise<Acces> {
    // ✅ Only encrypt if password provided, otherwise null
    const plainPassword = dto.password ?? null;
    const encryptedPassword = plainPassword
      ? this.encryptPassword(plainPassword)
      : null;

    // ✅ Optional email (null if missing)
    const email = dto.email ?? null;

    const acces = new Acces(
      uuidv4(),
      dto.userId,
      dto.status,
      dto.productCode,
      encryptedPassword,
      email
    );

    return this.accesRepo.create(acces);
  }
}
