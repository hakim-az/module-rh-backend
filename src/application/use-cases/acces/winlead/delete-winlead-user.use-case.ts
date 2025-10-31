import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import axios from "axios";
import { AccesRepository } from "@/domain/repositories/acces.repository";

@Injectable()
export class DeleteWinleadUserUseCase {
  private readonly API_URL =
    "https://extranet.winlead.fr/winlead/API/user.php/delete";
  private readonly API_KEY = process.env.WINLEAD_API_KEY ?? "";

  constructor(
    @Inject(AccesRepository)
    private readonly accesRepo: AccesRepository
  ) {
    if (!this.API_KEY) {
      throw new InternalServerErrorException(
        "WINLEAD_API_KEY is not configured"
      );
    }
  }

  async execute(data: { userIdLocal: string; email: string }) {
    const existingAcces = await this.accesRepo.findByUserIdAndProductCode(
      data.userIdLocal,
      "WINLEAD"
    );

    if (!existingAcces) {
      throw new NotFoundException("User does not have a WINLEAD access");
    }

    const body = {
      api_key: this.API_KEY,
      email: data.email,
    };

    try {
      const response = await axios.post(this.API_URL, body, {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.data?.success) {
        throw new InternalServerErrorException(
          `Winlead API error: ${response.data?.message || "Unknown error"}`
        );
      }

      await this.accesRepo.delete(existingAcces.id);

      return {
        success: true,
        message: "Winlead user deleted successfully",
      };
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // If Winlead API fails, delete from local DB anyway
      await this.accesRepo.delete(existingAcces.id);

      return {
        success: true,
        message: "Access deleted from local database (Winlead API unavailable)",
        warning: "User may still exist in Winlead system",
      };
    }
  }
}
