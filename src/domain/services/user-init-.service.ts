// // src/user/user-init.service.ts
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
    this.logger.log("🔥 UserInitService.onModuleInit() triggered");

    try {
      this.logger.log("Initializing default users...");

      const usersToInit = [
        {
          id: this.config.get<string>("INIT_ADMIN_ID"),
          role: this.config.get<string>("INIT_ADMIN_ROLE"),
          statut: this.config.get<string>("INIT_ADMIN_STATUT"),
          civilite: "M",
          prenom: "System",
          nomDeNaissance: "Administrator",
          emailPersonnel: this.config.get<string>("INIT_ADMIN_EMAIL"),
          emailProfessionnel: this.config.get<string>("INIT_ADMIN_EMAIL"),
        },
        {
          id: this.config.get<string>("INIT_RH_ID"),
          role: this.config.get<string>("INIT_RH_ROLE"),
          statut: this.config.get<string>("INIT_RH_STATUT"),
          civilite: "F",
          prenom: "Claire",
          nomDeNaissance: "RH",
          emailPersonnel: this.config.get<string>("INIT_RH_EMAIL"),
          emailProfessionnel: this.config.get<string>("INIT_RH_EMAIL"),
        },
        {
          id: this.config.get<string>("INIT_ASSISTANT_ID"),
          role: this.config.get<string>("INIT_ASSISTANT_ROLE"),
          statut: this.config.get<string>("INIT_ASSISTANT_STATUT"),
          civilite: "F",
          prenom: "Assistant",
          nomDeNaissance: "Assistant",
          emailPersonnel: this.config.get<string>("INIT_ASSISTANT_EMAIL"),
          emailProfessionnel: this.config.get<string>("INIT_ASSISTANT_EMAIL"),
        },
        {
          id: this.config.get<string>("INIT_GESTIONNAIRE_ID"),
          role: this.config.get<string>("INIT_GESTIONNAIRE_ROLE"),
          statut: this.config.get<string>("INIT_GESTIONNAIRE_STATUT"),
          civilite: "F",
          prenom: "Gestionnaire",
          nomDeNaissance: "Gestionnaire",
          emailPersonnel: this.config.get<string>("INIT_GESTIONNAIRE_EMAIL"),
          emailProfessionnel: this.config.get<string>(
            "INIT_GESTIONNAIRE_EMAIL"
          ),
        },
      ];

      for (const user of usersToInit) {
        if (!user.id || !user.emailPersonnel) {
          this.logger.warn(
            `Skipping user with role=${user.role}: missing id or email in .env`
          );
          continue;
        }

        // ✅ Check if user already exists (by ID or email)
        let existing = await this.getUserUseCase.execute(user.id);

        if (!existing && this.getUserUseCase.executeByEmail) {
          existing = await this.getUserUseCase.executeByEmail(
            user.emailPersonnel
          );
        }

        if (existing) {
          this.logger.log(`User already exists, Skipping creation.`);
          continue;
        }

        // ✅ Create only if user does NOT exist
        await this.createUserUseCase.execute({
          ...user,
          nomUsuel: user.nomDeNaissance,
          situationFamiliale: "Célibataire",
          numeroSecuriteSociale: "0000000000",
          telephonePersonnel: "0700000000",
          telephoneProfessionnel: "0700000000",
          avatar: "",
        });

        this.logger.log(`✅ user created`);
      }
    } catch (error: any) {
      this.logger.error("❌ Failed to initialize default users", {
        message: error.message,
        stack: error.stack,
      });
    }
  }
}
