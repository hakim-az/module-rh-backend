import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import {
  CreateContratDto,
  UpdateContratDto,
  ContratResponseDto,
} from "@application/dtos/contrat.dto";
import { CreateContratUseCase } from "@application/use-cases/contrat/create-contrat.use-case";
import { GetContratUseCase } from "@application/use-cases/contrat/get-contrat.use-case";
import { GetAllContratsUseCase } from "@application/use-cases/contrat/get-all-contrats.use-case";
import { GetContratsByUserUseCase } from "@application/use-cases/contrat/get-contrats-by-user.use-case";
import { UpdateContratUseCase } from "@application/use-cases/contrat/update-contrat.use-case";
import { DeleteContratUseCase } from "@application/use-cases/contrat/delete-contrat.use-case";
import { UploadFileUseCase } from "@/application/use-cases/file/upload-file.use-case";
import { UploadSignedContractUseCase } from "@/application/use-cases/contrat/upload-signed-contract.use-case";
import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { UploadSignedContractDto } from "@/application/dtos/contrat.dto";
import { UpdateUserUseCase } from "@/application/use-cases/user/update-user.use-case";
import { KeycloakAuthGuard } from "@/application/auth/keycloak-auth.guard";
import { GroupsGuard } from "@/application/auth/groups.guard";
import { Groups } from "@/application/auth/groups.decorator";
import { NotificationService } from "@/domain/services/notification.service";
import { GetUserUseCase } from "@/application/use-cases/user/get-user.use-case";
import { GetAllUsersUseCase } from "@/application/use-cases/user/get-all-users.use-case";
import { SendgridService } from "@/domain/services/sendgrid.service";
import { ContractGeneratorService } from "@/domain/services/contract-generator.service";
import { PDFDocument } from "pdf-lib";

@ApiTags("contrats")
@ApiBearerAuth()
@Controller("contrats")
@UseGuards(KeycloakAuthGuard)
export class ContratController {
  constructor(
    private readonly createContratUseCase: CreateContratUseCase,
    private readonly getContratUseCase: GetContratUseCase,
    private readonly getAllContratsUseCase: GetAllContratsUseCase,
    private readonly getContratsByUserUseCase: GetContratsByUserUseCase,
    private readonly updateContratUseCase: UpdateContratUseCase,
    private readonly deleteContratUseCase: DeleteContratUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly uploadSignedContractUseCase: UploadSignedContractUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly notificationService: NotificationService,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly sendgridService: SendgridService,
    private readonly generator: ContractGeneratorService
  ) {}

  // ADD CONTRACT - Génération automatique -----------------------------------------------------------
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

      // Upload signed PDF if provided
      if (fileMap["fichierContratSignerPdf"]) {
        fichierContratSignerPdf = await this.uploadFileUseCase.execute(
          fileMap["fichierContratSignerPdf"].buffer,
          fileMap["fichierContratSignerPdf"].originalname,
          fileMap["fichierContratSignerPdf"].mimetype
        );
      }
    }

    // ... dans ta fonction create

    if (!fichierContratNonSignerPdf) {
      const pdfBufferNonSignerAP =
        await this.generator.generateActionPrevoyanceContract(createContratDto);
      const pdfBufferNonSignerFR =
        await this.generator.generateFranceTelephoneContract(createContratDto);

      // 🔗 Concaténer les deux PDFs
      const mergedPdf = await PDFDocument.create();

      const pdfAP = await PDFDocument.load(pdfBufferNonSignerAP);
      const pdfFR = await PDFDocument.load(pdfBufferNonSignerFR);

      // Copier les pages du premier PDF
      const pagesAP = await mergedPdf.copyPages(pdfAP, pdfAP.getPageIndices());
      pagesAP.forEach((page) => mergedPdf.addPage(page));

      // Copier les pages du deuxième PDF
      const pagesFR = await mergedPdf.copyPages(pdfFR, pdfFR.getPageIndices());
      pagesFR.forEach((page) => mergedPdf.addPage(page));

      const mergedPdfBytes = await mergedPdf.save();

      // 🔹 Convert Uint8Array -> Buffer
      const mergedPdfBuffer = Buffer.from(mergedPdfBytes);

      // Upload merged PDF to S3
      fichierContratNonSignerPdf = await this.uploadFileUseCase.execute(
        mergedPdfBuffer,
        `contrat-non-signe-${Date.now()}.pdf`,
        "application/pdf"
      );
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

    // Notification message
    const description = `Votre contrat de travail (${contrat.typeContrat ?? "contrat"}) a été ajouté par le service RH. Veuillez le signer dès que possible.`;

    // Send in-app notification
    await this.notificationService.createCustomNotification(
      user.id,
      "Contrat de travail à signer",
      description.trim()
    );

    // Send email via SendGrid
    await this.sendgridService.sendEmail({
      to: user.emailProfessionnel,
      from: process.env.SENDGRID_FROM_EMAIL,
      templateId: "d-8df2a27d88ad4a7d93485cc077e62c02",
      dynamicTemplateData: {
        prenom: user?.prenom,
        nom: user?.nomDeNaissance,
        poste: contrat.poste ?? "Non renseigné",
        typeContrat: contrat.typeContrat ?? "Contrat",
        dateDebut: contrat.dateDebut
          ? new Date(contrat.dateDebut).toLocaleDateString()
          : "Non renseignée",
        dateFin: contrat.dateFin
          ? new Date(contrat.dateFin).toLocaleDateString()
          : "Non renseignée",
        salaire: contrat.salaire ? `${contrat.salaire} €` : "Non renseigné",
        matricule: contrat.matricule ?? "Non renseigné",
        actionUrl: `${process.env.APP_URL}/accueil`,
        currentYear: new Date().getFullYear(),
        subject: "Contrat de travail à signer",
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

  // GET ALL CONTRACTS ------------------------------------------------------------------
  @Get()
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Gestionnaire", "RH-Admin")
  @ApiOperation({ summary: "Get all contracts" })
  @ApiResponse({
    status: 200,
    description: "Contracts retrieved successfully",
    type: [ContratResponseDto],
  })
  async findAll(): Promise<ContratResponseDto[]> {
    try {
      const contrats = (await this.getAllContratsUseCase.execute()) ?? [];
      return contrats.map((contrat) => ({
        id: contrat.id,
        idUser: contrat.idUser,
        poste: contrat.poste,
        typeContrat: contrat.typeContrat,
        dateDebut: contrat.dateDebut,
        dateFin: contrat.dateFin,
        etablissementDeSante: contrat.etablissementDeSante,
        serviceDeSante: contrat.serviceDeSante,
        salaire: contrat.salaire,
        matricule: contrat.matricule,
        fichierContratNonSignerPdf: contrat.fichierContratNonSignerPdf,
        fichierContratSignerPdf: contrat.fichierContratSignerPdf,
        createdAt: contrat.createdAt,
        updatedAt: contrat.updatedAt,
      }));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET CONTRACTS BY USER ID --------------------------------------------------
  @Get("user/:userId")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Gestionnaire", "RH-Admin")
  @ApiOperation({ summary: "Get contracts by user ID" })
  @ApiResponse({
    status: 200,
    description: "User contracts retrieved successfully",
    type: [ContratResponseDto],
  })
  async findByUser(
    @Param("userId") userId: string
  ): Promise<ContratResponseDto[]> {
    try {
      const contrats = await this.getContratsByUserUseCase.execute(userId);
      return contrats.map((contrat) => ({
        id: contrat.id,
        idUser: contrat.idUser,
        poste: contrat.poste,
        typeContrat: contrat.typeContrat,
        dateDebut: contrat.dateDebut,
        dateFin: contrat.dateFin,
        etablissementDeSante: contrat.etablissementDeSante,
        serviceDeSante: contrat.serviceDeSante,
        salaire: contrat.salaire,
        matricule: contrat.matricule,
        fichierContratNonSignerPdf: contrat.fichierContratNonSignerPdf,
        fichierContratSignerPdf: contrat.fichierContratSignerPdf,
        createdAt: contrat.createdAt,
        updatedAt: contrat.updatedAt,
      }));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // GET CONTRACT BY ID -----------------------------------------------------------
  @Get(":id")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Gestionnaire", "RH-Admin")
  @ApiOperation({ summary: "Get a contract by ID" })
  @ApiResponse({
    status: 200,
    description: "Contract retrieved successfully",
    type: ContratResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<ContratResponseDto> {
    try {
      const contrat = await this.getContratUseCase.execute(id);
      if (!contrat) {
        throw new HttpException("Contract not found", HttpStatus.NOT_FOUND);
      }
      return {
        id: contrat.id,
        idUser: contrat.idUser,
        poste: contrat.poste,
        typeContrat: contrat.typeContrat,
        dateDebut: contrat.dateDebut,
        dateFin: contrat.dateFin,
        etablissementDeSante: contrat.etablissementDeSante,
        serviceDeSante: contrat.serviceDeSante,
        salaire: contrat.salaire,
        matricule: contrat.matricule,
        fichierContratNonSignerPdf: contrat.fichierContratNonSignerPdf,
        fichierContratSignerPdf: contrat.fichierContratSignerPdf,
        createdAt: contrat.createdAt,
        updatedAt: contrat.updatedAt,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // UPDATE CONTRACT BY ID -----------------------------------------------------------
  @Patch(":id")
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
  @ApiOperation({ summary: "Update a contract" })
  @ApiResponse({
    status: 200,
    description: "Contract updated successfully",
    type: ContratResponseDto,
  })
  async update(
    @Param("id") id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body(ValidationPipe) updateContratDto: UpdateContratDto
  ): Promise<ContratResponseDto> {
    const fileMap = Object.fromEntries(files.map((f) => [f.fieldname, f]));

    if (fileMap["fichierContratNonSignerPdf"]) {
      const fileName = await this.uploadFileUseCase.execute(
        fileMap["fichierContratNonSignerPdf"].buffer,
        fileMap["fichierContratNonSignerPdf"].originalname,
        fileMap["fichierContratNonSignerPdf"].mimetype
      );
      updateContratDto.fichierContratNonSignerPdf = fileName;
    }

    if (fileMap["fichierContratSignerPdf"]) {
      const fileName = await this.uploadFileUseCase.execute(
        fileMap["fichierContratSignerPdf"].buffer,
        fileMap["fichierContratSignerPdf"].originalname,
        fileMap["fichierContratSignerPdf"].mimetype
      );
      updateContratDto.fichierContratSignerPdf = fileName;
    }

    const contrat = await this.updateContratUseCase.execute(
      id,
      updateContratDto
    );

    return {
      id: contrat.id,
      idUser: contrat.idUser,
      poste: contrat.poste,
      typeContrat: contrat.typeContrat,
      dateDebut: contrat.dateDebut,
      dateFin: contrat.dateFin,
      etablissementDeSante: contrat.etablissementDeSante,
      serviceDeSante: contrat.serviceDeSante,
      salaire: contrat.salaire,
      matricule: contrat.matricule,
      fichierContratNonSignerPdf: contrat.fichierContratNonSignerPdf ?? "",
      fichierContratSignerPdf: contrat.fichierContratSignerPdf ?? "",
      createdAt: contrat.createdAt,
      updatedAt: contrat.updatedAt,
    };
  }

  // DELETE CONTRACT BY ID ----------------------------------------------------------
  @Delete(":id")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Gestionnaire", "RH-Admin")
  @ApiOperation({ summary: "Delete a contract" })
  @ApiResponse({ status: 200, description: "Contract deleted successfully" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    try {
      await this.deleteContratUseCase.execute(id);
      return { message: "Contract deleted successfully" };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // ADD SIGNED CONTRACT BY USER ID ----------------------------------------------------------
  @Patch("user/:userId/upload-signed")
  @UseGuards(GroupsGuard)
  @Groups(
    "Users",
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
    FileInterceptor("fichierContratSignerPdf", {
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
  @ApiOperation({ summary: "Upload signed contract for a user" })
  @ApiResponse({
    status: 200,
    description:
      "Signed contract uploaded successfully and user status updated to 'contract-signed'",
    type: ContratResponseDto,
  })
  async uploadSignedContract(
    @Param("userId") userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadSignedContractDto: UploadSignedContractDto
  ): Promise<ContratResponseDto> {
    try {
      let fichierContratSignerPdf =
        uploadSignedContractDto.fichierContratSignerPdf ?? "";

      if (file) {
        fichierContratSignerPdf = await this.uploadFileUseCase.execute(
          file.buffer,
          file.originalname,
          file.mimetype
        );
      }

      const contrat = await this.uploadSignedContractUseCase.execute(userId, {
        fichierContratSignerPdf,
      });

      // ✅ Mettre à jour le statut de l'utilisateur
      const user = await this.updateUserUseCase.execute(userId, {
        statut: "contract-signed",
      });

      // 🔔 Récupérer tous les utilisateurs
      const allUsers = await this.getAllUsersUseCase.execute();

      // 🔎 Filtrer uniquement ceux qui ont un rôle RH
      const rhUsers = allUsers.filter((u) =>
        ["admin", "hr", "assistant", "gestionnaire"].includes(u.role)
      );

      // 📢 Envoyer la notification à tous les RH
      for (const rhUser of rhUsers) {
        const description = `${user?.nomDeNaissance ?? ""} ${user?.prenom ?? ""} a signé son contrat de travail (${contrat.typeContrat ?? "contrat"}).`;

        await this.notificationService.createCustomNotification(
          rhUser.id,
          "Contrat signé",
          description.trim()
        );
      }

      // Envoi d’un email via SendGrid aux RH
      for (const rhUser of rhUsers) {
        await this.sendgridService.sendEmail({
          to: rhUser.emailProfessionnel,
          from: process.env.SENDGRID_FROM_EMAIL,
          templateId: "d-b79c4865eed14dfd98d41d3e51dfc8fd",
          dynamicTemplateData: {
            prenom: user?.prenom,
            nom: user?.nomDeNaissance,
            poste: contrat.poste ?? "Non renseigné",
            typeContrat: contrat.typeContrat ?? "Contrat",
            dateDebut: contrat.dateDebut
              ? new Date(contrat.dateDebut).toLocaleDateString()
              : "Non renseignée",
            dateFin: contrat.dateFin
              ? new Date(contrat.dateFin).toLocaleDateString()
              : "Non renseignée",
            salaire: contrat.salaire ? `${contrat.salaire} €` : "Non renseigné",
            matricule: contrat.matricule ?? "Non renseigné",
            actionUrl: `${process.env.APP_URL}/accueil/salariés/${user.id}`,
            currentYear: new Date().getFullYear(),
          },
        });
      }

      return {
        id: contrat.id,
        idUser: contrat.idUser,
        poste: contrat.poste,
        typeContrat: contrat.typeContrat,
        dateDebut: contrat.dateDebut,
        dateFin: contrat.dateFin,
        etablissementDeSante: contrat.etablissementDeSante,
        serviceDeSante: contrat.serviceDeSante,
        salaire: contrat.salaire,
        matricule: contrat.matricule,
        fichierContratNonSignerPdf: contrat.fichierContratNonSignerPdf ?? "",
        fichierContratSignerPdf: contrat.fichierContratSignerPdf ?? "",
        createdAt: contrat.createdAt,
        updatedAt: contrat.updatedAt,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
