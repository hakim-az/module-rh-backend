import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpException,
  HttpStatus,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor, AnyFilesInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

import {
  CreateRestauDto,
  RestauResponseDto,
  UpdateRestauDto,
} from "@application/dtos/restau.dto";
import { GroupsGuard } from "@/application/auth/groups.guard";
import { Groups } from "@/application/auth/groups.decorator";
import { KeycloakAuthGuard } from "@/application/auth/keycloak-auth.guard";

import { CreateRestauUseCase } from "@application/use-cases/restau/create-restau.use-case";
import { GetRestauxByUserUseCase } from "@application/use-cases/restau/get-restaux-by-user.use-case";
import { DeleteRestauUseCase } from "@application/use-cases/restau/delete-restau.use-case";
import { UpdateRestauUseCase } from "@application/use-cases/restau/update-restau.use-case";
import { UploadFileUseCase } from "@application/use-cases/file/upload-file.use-case";
import { GetAllRestauxUseCase } from "@application/use-cases/restau/get-all-restaux.use-case";
import { GetRestauUseCase } from "@application/use-cases/restau/get-restau.use-case";
import { GetUserUseCase } from "@/application/use-cases/user/get-user.use-case";
import { NotificationService } from "@/domain/services/notification.service";
import { SendgridService } from "@/domain/services/sendgrid.service";

@ApiTags("restaux")
@ApiBearerAuth()
@Controller("restaux")
@UseGuards(KeycloakAuthGuard)
export class RestauController {
  constructor(
    private readonly createRestauUseCase: CreateRestauUseCase,
    private readonly getRestauxByUserUseCase: GetRestauxByUserUseCase,
    private readonly deleteRestauUseCase: DeleteRestauUseCase,
    private readonly updateRestauUseCase: UpdateRestauUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly getAllRestauxUseCase: GetAllRestauxUseCase,
    private readonly getRestauUseCase: GetRestauUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly notificationService: NotificationService,
    private readonly sendgridService: SendgridService
  ) {}

  // GET RESTAU ALL ----------------------------------------------------------------------------------------------
  @Get()
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Gestionnaire", "RH-Admin")
  @ApiOperation({ summary: "Get all restaus" })
  @ApiResponse({
    status: 200,
    description: "Restaus retrieved successfully",
    type: [RestauResponseDto],
  })
  async findAll(): Promise<RestauResponseDto[]> {
    try {
      const restaus = await this.getAllRestauxUseCase.execute();

      // Sort restaus by createdAt descending (recent first)
      const sortedRestaus = restaus.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      return sortedRestaus.map((restau) => ({
        id: restau.id,
        idUser: restau.idUser,
        nbrJours: restau.nbrJours,
        mois: restau.mois,
        annee: restau.annee,
        note: restau.note,
        fichierJustificatifPdf: restau.fichierJustificatifPdf ?? "",
        createdAt: restau.createdAt?.toISOString(),
        updatedAt: restau.updatedAt?.toISOString(),
        user: restau.user
          ? {
              nomDeNaissance: restau.user.nomDeNaissance,
              prenom: restau.user.prenom,
              emailProfessionnel: restau.user.emailProfessionnel,
              avatar: restau.user.avatar,
            }
          : undefined,
      }));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // GET RESTAU BY ID ----------------------------------------------------------------------------------------------
  @Get(":id")
  @UseGuards(GroupsGuard) // ✅ check groups only for this route
  @Groups("RH-Manager", "RH-Assistant", "RH-Gestionnaire", "RH-Admin")
  @ApiOperation({ summary: "Get a single restau by ID" })
  @ApiResponse({
    status: 200,
    description: "Restau retrieved successfully",
    type: RestauResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<RestauResponseDto> {
    try {
      const restau = await this.getRestauUseCase.execute(id);
      if (!restau) {
        throw new HttpException("Restau not found", HttpStatus.NOT_FOUND);
      }
      return {
        id: restau.id,
        idUser: restau.idUser,
        nbrJours: restau.nbrJours,
        mois: restau.mois,
        annee: restau.annee,
        note: restau.note,
        fichierJustificatifPdf: restau.fichierJustificatifPdf ?? "",
        createdAt: restau.createdAt?.toISOString(),
        updatedAt: restau.updatedAt?.toISOString(),
        user: restau.user
          ? {
              nomDeNaissance: restau.user.nomDeNaissance,
              prenom: restau.user.prenom,
              emailProfessionnel: restau.user.emailProfessionnel,
              avatar: restau.user.avatar,
            }
          : undefined,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // ADD RESTAU ----------------------------------------------------------------------------------------------
  @Post()
  @UseGuards(GroupsGuard) // ✅ check groups only for this route
  @Groups("RH-Manager", "RH-Assistant", "RH-Gestionnaire", "RH-Admin")
  @UseInterceptors(
    FileInterceptor("fichierJustificatifPdf", {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
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
  @ApiOperation({ summary: "Create a restau with optional justification file" })
  @ApiResponse({ status: 201, description: "Restau created successfully" })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createRestauDto: CreateRestauDto
  ): Promise<RestauResponseDto> {
    let fichierJustificatifPdf = createRestauDto.fichierJustificatifPdf ?? "";

    if (file) {
      fichierJustificatifPdf = await this.uploadFileUseCase.execute(
        file.buffer,
        file.originalname,
        file.mimetype
      );
    }

    const restau = await this.createRestauUseCase.execute({
      ...createRestauDto,
      fichierJustificatifPdf,
    });

    // 🔹 Envoyer une notification à l'utilisateur
    const user = await this.getUserUseCase.execute(restau.idUser);
    const description = `Le service RH a ajouté un suivi de titre restaurant${restau.mois && restau.annee ? ` pour le mois de ${restau.mois}/${restau.annee}` : ""}${restau.nbrJours ? ` d'une valeur de ${restau.nbrJours} jours` : ""}.`;

    await this.notificationService.createCustomNotification(
      user.id,
      "Nouveau suivi de titre restaurant",
      description.trim()
    );

    // Send notification email via SendGrid
    await this.sendgridService.sendEmail({
      to: user.emailProfessionnel,
      from: process.env.SENDGRID_FROM_EMAIL,
      templateId: "d-1994e968583a482cb21629a498cda743",
      dynamicTemplateData: {
        prenom: user?.prenom,
        nom: user?.nomDeNaissance,
        nbrJours: restau.nbrJours,
        mois: restau.mois,
        annee: restau.annee,
        note: restau.note,
        actionUrl: `${process.env.APP_URL}/accueil/coffre-fort`,
        currentYear: new Date().getFullYear(),
        subject: "Nouveau bulletin disponible dans votre coffre",
      },
    });

    return {
      id: restau.id,
      idUser: restau.idUser,
      nbrJours: restau.nbrJours,
      mois: restau.mois,
      annee: restau.annee,
      note: restau.note,
      fichierJustificatifPdf: restau.fichierJustificatifPdf ?? "",
      createdAt: restau.createdAt?.toISOString(),
      updatedAt: restau.updatedAt?.toISOString(),
      user: restau.user
        ? {
            nomDeNaissance: restau.user.nomDeNaissance,
            prenom: restau.user.prenom,
            emailProfessionnel: restau.user.emailProfessionnel,
            avatar: restau.user.avatar,
          }
        : undefined,
    };
  }

  // ADD RESTAU BY USER ID ----------------------------------------------------------------------------------------------
  @Get("user/:userId")
  @UseGuards(GroupsGuard)
  @Groups(
    "RH-Manager",
    "RH-Admin",
    "RH-Gestionnaire",
    "RH-Assistant",
    "Prospection-Admin",
    "Prospection-Commercial",
    "Prospection-Directeur",
    "Prospection-Gestionnaire",
    "Prospection-Manager",
    "Vente-Admin",
    "Vente-Commercial",
    "Vente-Manager"
  )
  @ApiOperation({ summary: "Get restaus by user ID" })
  @ApiResponse({ status: 200, description: "Restaus retrieved successfully" })
  async findByUser(
    @Param("userId") userId: string
  ): Promise<RestauResponseDto[]> {
    const restaus = await this.getRestauxByUserUseCase.execute(userId);

    // Sort restaus by createdAt descending (most recent first)
    const sortedRestaus = restaus.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return sortedRestaus.map((restau) => ({
      id: restau.id,
      idUser: restau.idUser,
      nbrJours: restau.nbrJours,
      mois: restau.mois,
      annee: restau.annee,
      note: restau.note,
      fichierJustificatifPdf: restau.fichierJustificatifPdf ?? "",
      createdAt: restau.createdAt?.toISOString(),
      updatedAt: restau.updatedAt?.toISOString(),
      user: restau.user
        ? {
            nomDeNaissance: restau.user.nomDeNaissance,
            prenom: restau.user.prenom,
            emailProfessionnel: restau.user.emailProfessionnel,
            avatar: restau.user.avatar,
          }
        : undefined,
    }));
  }

  // UPDATE RESTAU BY ID ----------------------------------------------------------------------------------------------
  @Patch(":id")
  @UseGuards(GroupsGuard)
  @Groups(
    "RH-Manager",
    "RH-Admin",
    "RH-Gestionnaire",
    "RH-Assistant",
    "Prospection-Admin",
    "Prospection-Commercial",
    "Prospection-Directeur",
    "Prospection-Gestionnaire",
    "Prospection-Manager",
    "Vente-Admin",
    "Vente-Commercial",
    "Vente-Manager"
  )
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
  @ApiOperation({ summary: "Update a restau" })
  @ApiResponse({ status: 200, description: "Restau updated successfully" })
  async update(
    @Param("id") id: string,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Body() updateRestauDto: UpdateRestauDto
  ): Promise<RestauResponseDto> {
    const fileMap = Object.fromEntries(
      (files ?? []).map((f) => [f.fieldname, f])
    );

    if (fileMap["fichierJustificatifPdf"]) {
      const fileName = await this.uploadFileUseCase.execute(
        fileMap["fichierJustificatifPdf"].buffer,
        fileMap["fichierJustificatifPdf"].originalname,
        fileMap["fichierJustificatifPdf"].mimetype
      );
      updateRestauDto.fichierJustificatifPdf = fileName;
    }

    const restau = await this.updateRestauUseCase.execute(id, updateRestauDto);

    // 🔹 Envoyer une notification à l'utilisateur
    const user = await this.getUserUseCase.execute(restau.idUser);
    const description = `Le suivi de votre titre restaurant a été mis à jour${restau.mois && restau.annee ? ` pour le mois de ${restau.mois}/${restau.annee}` : ""}${restau.nbrJours ? ` avec ${restau.nbrJours} jours` : ""}.`;

    await this.notificationService.createCustomNotification(
      user.id,
      "Mise à jour du suivi de titre restaurant",
      description.trim()
    );

    return {
      id: restau.id,
      idUser: restau.idUser,
      nbrJours: restau.nbrJours,
      mois: restau.mois,
      annee: restau.annee,
      note: restau.note,
      fichierJustificatifPdf: restau.fichierJustificatifPdf ?? "",
      createdAt: restau.createdAt?.toISOString(),
      updatedAt: restau.updatedAt?.toISOString(),
      user: restau.user
        ? {
            nomDeNaissance: restau.user.nomDeNaissance,
            prenom: restau.user.prenom,
            emailProfessionnel: restau.user.emailProfessionnel,
            avatar: restau.user.avatar,
          }
        : undefined,
    };
  }

  // ADD RESTAU BY ID ----------------------------------------------------------------------------------------------
  @Delete(":id")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Gestionnaire", "RH-Admin")
  @ApiOperation({ summary: "Delete a restau" })
  @ApiResponse({ status: 200, description: "Restau deleted successfully" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.deleteRestauUseCase.execute(id);
    return { message: "Restau deleted successfully" };
  }
}
