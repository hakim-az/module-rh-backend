import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import axios from "axios";
import { CreateAccesUseCase } from "../create-acces.use-case";
import { CreateAccesDto } from "@/application/dtos/acces.dto";
import { AccesRepository } from "@/domain/repositories/acces.repository";

@Injectable()
export class CreateWinleadUserUseCase {
  private readonly API_URL =
    "https://extranet.winlead.fr/winlead/API/user.php/add";
  private readonly API_KEY = process.env.WINLEAD_API_KEY ?? "";

  constructor(
    @Inject(CreateAccesUseCase)
    private readonly createAccesUseCase: CreateAccesUseCase,
    @Inject(AccesRepository)
    private readonly accesRepo: AccesRepository
  ) {
    if (!this.API_KEY) {
      throw new InternalServerErrorException(
        "WINLEAD_API_KEY is not configured"
      );
    }
  }

  // ✅ Auto-generate secure password
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

  async execute(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    login: string;
    signature: string;
    role: string;
    userIdLocal: string;
  }) {
    // 0️⃣ Check if user already has Winlead access
    const existingAcces = await this.accesRepo.findByUserIdAndProductCode(
      data.userIdLocal,
      "WINLEAD"
    );

    if (existingAcces) {
      throw new ConflictException("User already has a WINLEAD access");
    }

    // ✅ Generate password internally
    const generatedPassword = this.generatePassword();

    const body = {
      api_key: this.API_KEY,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      login: data.login,
      pwd: generatedPassword,
      signature: data.signature,
      role: data.role,
    };

    try {
      // 1️⃣ Create user in Winlead
      const response = await axios.post(this.API_URL, body, {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.data?.success) {
        throw new InternalServerErrorException(
          `Winlead API error: ${response.data?.message || "Unknown error"}`
        );
      }

      // 2️⃣ Create access in DB
      const accesDto: CreateAccesDto = {
        userId: data.userIdLocal,
        status: "ONLINE",
        productCode: "WINLEAD",
        password: generatedPassword, // ✅ store the same generated password encrypted
        email: data.email,
      };

      return await this.createAccesUseCase.execute(accesDto);
    } catch (error: any) {
      console.error(error.response?.data || error.message || error);
      throw new InternalServerErrorException("Failed to create Winlead user");
    }
  }
}
