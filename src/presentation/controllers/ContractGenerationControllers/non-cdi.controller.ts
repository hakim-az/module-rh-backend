import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { CreateContratDto } from "@application/dtos/contrat.dto";
import { CreateContratUseCase } from "@application/use-cases/contrat/create-contrat.use-case";
import { UploadFileUseCase } from "@/application/use-cases/file/upload-file.use-case";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { KeycloakAuthGuard } from "@/application/auth/keycloak-auth.guard";
import { GroupsGuard } from "@/application/auth/groups.guard";
import { Groups } from "@/application/auth/groups.decorator";
import { NotificationService } from "@/domain/services/notification.service";
import { GetUserUseCase } from "@/application/use-cases/user/get-user.use-case";
import { SendgridService } from "@/domain/services/sendgrid.service";
import { UpdateUserUseCase } from "@/application/use-cases/user/update-user.use-case";

@ApiTags("contrats-non-cdi")
@ApiBearerAuth()
@Controller("contrats-non-cdi")
@UseGuards(KeycloakAuthGuard)
export class ContratNonCdiController {
  constructor(
    private readonly createContratUseCase: CreateContratUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly notificationService: NotificationService,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly sendgridService: SendgridService
  ) {}

  // ADD CONTRACT - NONE CDI -----------------------------------------------------------
  @Post()
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Gestionnaire", "RH-Admin")
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
          return cb(
            new HttpException(
              "Only PDF files are allowed",
              HttpStatus.BAD_REQUEST
            ),
            false
          );
        }
        cb(null, true);
      },
    })
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Body() createContratDto: CreateContratDto
  ) {
    // Initialize PDF fields
    let fichierContratSignerPdf =
      createContratDto.fichierContratSignerPdf ?? "";
    let fichierContratNonSignerPdf =
      createContratDto.fichierContratNonSignerPdf ?? "";

    // Map uploaded files if any
    if (files && Array.isArray(files)) {
      const fileMap = Object.fromEntries(files.map((f) => [f.fieldname, f]));

      // Upload none signed PDF if provided
      if (fileMap["fichierContratNonSignerPdf"]) {
        fichierContratNonSignerPdf = await this.uploadFileUseCase.execute(
          fileMap["fichierContratNonSignerPdf"].buffer,
          fileMap["fichierContratNonSignerPdf"].originalname,
          fileMap["fichierContratNonSignerPdf"].mimetype
        );
      }

      // Upload signed PDF if provided
      if (fileMap["fichierContratSignerPdf"]) {
        fichierContratSignerPdf = await this.uploadFileUseCase.execute(
          fileMap["fichierContratSignerPdf"].buffer,
          fileMap["fichierContratSignerPdf"].originalname,
          fileMap["fichierContratSignerPdf"].mimetype
        );
      }
    }

    // Prepare contract data
    const contratData = {
      ...createContratDto,
      fichierContratNonSignerPdf,
      fichierContratSignerPdf,
    };

    // Save contract in DB
    const contrat = await this.createContratUseCase.execute(contratData);

    // Get user who owns the contract
    const user = await this.getUserUseCase.execute(contrat.idUser);

    // ✅ Update user status to "user-approved"
    await this.updateUserUseCase.execute(user.id, {
      statut: "user-approuved", // <-- adapt this to match your enum/DB field
    });

    // 🔔 Si le statut est "user-approuved", notifier le salarié
    const description = `Votre profil a été validé par le service RH. Vous avez maintenant accès à votre espace personnel.`;

    await this.notificationService.createCustomNotification(
      user.id,
      "Profil approuvé",
      description.trim()
    );

    // Envoi email au salarié
    await this.sendgridService.sendEmail({
      to: user.emailProfessionnel,
      from: process.env.SENDGRID_FROM_EMAIL,
      templateId: "d-647da8e09caa43eca7cc970012c32938",
      dynamicTemplateData: {
        prenom: user?.prenom,
        nom: user?.nomDeNaissance,
        actionUrl: `${process.env.APP_URL}/accueil`,
        currentYear: new Date().getFullYear(),
      },
    });

    // Return saved contract
    return {
      id: contrat.id,
      idUser: contrat.idUser,
      poste: contrat.poste,
      typeContrat: contrat.typeContrat,
      dateDebut: contrat.dateDebut?.toISOString(),
      dateFin: contrat.dateFin?.toISOString(),
      etablissementDeSante: contrat.etablissementDeSante,
      serviceDeSante: contrat.serviceDeSante,
      salaire: contrat.salaire,
      matricule: contrat.matricule,
      fichierContratNonSignerPdf: contrat.fichierContratNonSignerPdf ?? "",
      fichierContratSignerPdf: contrat.fichierContratSignerPdf ?? "",
      createdAt: contrat.createdAt?.toISOString(),
      updatedAt: contrat.updatedAt?.toISOString(),
    };
  }
}
