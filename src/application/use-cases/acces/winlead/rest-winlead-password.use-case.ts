import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import axios from "axios";
import { AccesRepository } from "@/domain/repositories/acces.repository";
import { CreateAccesUseCase } from "../create-acces.use-case"; // to use encryptPassword
import { Acces } from "@/domain/entities/acces.entity";

@Injectable()
export class ResetWinleadPasswordUseCase {
  private readonly API_URL =
    "https://extranet.winlead.fr/winlead/API/user.php/update_password";
  private readonly API_KEY = process.env.WINLEAD_API_KEY ?? "";

  constructor(
    @Inject(AccesRepository)
    private readonly accesRepo: AccesRepository,
    @Inject(CreateAccesUseCase)
    private readonly createAccesUseCase: CreateAccesUseCase
  ) {
    if (!this.API_KEY) {
      throw new InternalServerErrorException(
        "WINLEAD_API_KEY is not configured"
      );
    }
  }

  async execute(data: {
    userId: string;
    email: string;
    newPassword: string;
  }): Promise<Acces> {
    // 1️⃣ Check if access exists
    const acces = await this.accesRepo.findByUserIdAndProductCode(
      data.userId,
      "WINLEAD"
    );
    if (!acces) {
      throw new NotFoundException("No WINLEAD access found for this user");
    }

    const body = {
      api_key: this.API_KEY,
      email: data.email,
      new_password: data.newPassword,
    };

    try {
      // 2️⃣ Update password in Winlead
      const response = await axios.put(this.API_URL, body, {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.data?.success) {
        throw new InternalServerErrorException(
          `Winlead API error: ${response.data?.message || "Unknown error"}`
        );
      }

      // 3️⃣ Update password in local DB (AES encrypted)
      acces.password = this.createAccesUseCase["encryptPassword"](
        data.newPassword
      );
      return await this.accesRepo.save(acces);
    } catch (error: any) {
      console.error(error.response?.data || error.message || error);
      throw new InternalServerErrorException(
        "Failed to reset password in Winlead"
      );
    }
  }
}
