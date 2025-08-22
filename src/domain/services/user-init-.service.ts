// src/user/user-init.service.ts
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateUserUseCase } from "@/application/use-cases/user/create-user.use-case";
import { GetUserUseCase } from "@/application/use-cases/user/get-user.use-case";

@Injectable()
export class UserInitService implements OnModuleInit {
  private readonly logger = new Logger(UserInitService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log("Initializing default users...");

      // Define your bootstrap users (Admin + RH)
      const usersToInit = [
        {
          id: this.config.get<string>("INIT_ADMIN_ID"),
          role: "admin",
          statut: "profile-completed",
          civilite: "M",
          prenom: "System",
          nomDeNaissance: "Administrator",
          emailPersonnel: this.config.get<string>("INIT_ADMIN_EMAIL"),
          emailProfessionnel: this.config.get<string>("INIT_ADMIN_EMAIL"),
        },
        {
          id: this.config.get<string>("INIT_RH_ID"),
          role: "rh",
          statut: "profile-completed",
          civilite: "F",
          prenom: "Claire",
          nomDeNaissance: "RH",
          emailPersonnel: this.config.get<string>("INIT_RH_EMAIL"),
          emailProfessionnel: this.config.get<string>("INIT_RH_EMAIL"),
        },
      ];

      for (const user of usersToInit) {
        if (!user.id || !user.emailPersonnel) {
          this.logger.warn(
            `Skipping user with role=${user.role}: missing id or email in .env`
          );
          continue;
        }

        // Check if user exists
        const existing = await this.getUserUseCase.execute(user.id);

        if (existing) {
          this.logger.log(
            `User with role=${user.role} already exists (id=${existing.id}, email=${existing.emailPersonnel}). Skipping creation.`
          );
          continue;
        }

        // Create user
        await this.createUserUseCase.execute({
          ...user,
          nomUsuel: user.nomDeNaissance,
          situationFamiliale: "Célibataire",
          numeroSecuriteSociale: "0000000000",
          telephonePersonnel: "0700000000",
          telephoneProfessionnel: "0700000000",
          avatar: "",
        });

        this.logger.log(
          `✅ ${user.role.toUpperCase()} user created (id=${user.id}, email=${user.emailPersonnel}).`
        );
      }
    } catch (error: any) {
      this.logger.error("❌ Failed to initialize default users", {
        message: error.message,
        stack: error.stack,
      });
    }
  }
}
