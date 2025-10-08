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
import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { KeycloakAuthGuard } from "@/application/auth/keycloak-auth.guard";
import { GroupsGuard } from "@/application/auth/groups.guard";
import { Groups } from "@/application/auth/groups.decorator";
import { NotificationService } from "@/domain/services/notification.service";
import { GetUserUseCase } from "@/application/use-cases/user/get-user.use-case";
import { SendgridService } from "@/domain/services/sendgrid.service";
import { ContractGeneratorService } from "@/domain/services/contract-generator.service";

@ApiTags("contrats-cdi")
@ApiBearerAuth()
@Controller("contrats-cdi")
@UseGuards(KeycloakAuthGuard)
export class ContratCdiController {
  constructor(
    private readonly createContratUseCase: CreateContratUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly notificationService: NotificationService,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly sendgridService: SendgridService,
    private readonly generator: ContractGeneratorService
  ) {}

  // ADD CONTRACT - WINVEST CAPITAL CDI -----------------------------------------------------------
  @Post("wc")
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
  async createWC(
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
      const pdfBufferNonSignerCdiWC =
        await this.generator.generateWinvestCapitalCDIContract(
          createContratDto
        );

      // Upload merged PDF to S3
      fichierContratNonSignerPdf = await this.uploadFileUseCase.execute(
        pdfBufferNonSignerCdiWC,
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
      templateId: "d-68cb24823d8d4e1c8d62ee0e7f78e223",
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

  // ADD CONTRACT - FRANCE TELEPHONE TELECONSEILLER CDI -----------------------------------------------------------
  @Post("fr-teleconseiller")
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
  async createFrTeleconseiller(
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
      const pdfBufferNonSignerCdiWC =
        await this.generator.generateFranceTelephoneTéléconseillerCDIContract(
          createContratDto
        );

      // Upload merged PDF to S3
      fichierContratNonSignerPdf = await this.uploadFileUseCase.execute(
        pdfBufferNonSignerCdiWC,
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
      templateId: "d-68cb24823d8d4e1c8d62ee0e7f78e223",
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

  // ADD CONTRACT - FRANCE TELEPHONE CDI -----------------------------------------------------------
  @Post("fr")
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
  async createFr(
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
      const pdfBufferNonSignerCdiWC =
        await this.generator.generateFranceTelephoneCDIContract(
          createContratDto
        );

      // Upload merged PDF to S3
      fichierContratNonSignerPdf = await this.uploadFileUseCase.execute(
        pdfBufferNonSignerCdiWC,
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
      templateId: "d-68cb24823d8d4e1c8d62ee0e7f78e223",
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

  // ADD CONTRACT - ACTION PREVOYANCE CDI -----------------------------------------------------------
  @Post("ap")
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
  async createAP(
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
      const pdfBufferNonSignerCdiWC =
        await this.generator.generateActionPrevoyancCDIContract(
          createContratDto
        );

      // Upload merged PDF to S3
      fichierContratNonSignerPdf = await this.uploadFileUseCase.execute(
        pdfBufferNonSignerCdiWC,
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
    // await this.sendgridService.sendEmail({
    //   to: user.emailProfessionnel,
    //   from: process.env.SENDGRID_FROM_EMAIL,
    //   templateId: "d-68cb24823d8d4e1c8d62ee0e7f78e223",
    //   dynamicTemplateData: {
    //     prenom: user?.prenom,
    //     nom: user?.nomDeNaissance,
    //     poste: contrat.poste ?? "Non renseigné",
    //     typeContrat: contrat.typeContrat ?? "Contrat",
    //     dateDebut: contrat.dateDebut
    //       ? new Date(contrat.dateDebut).toLocaleDateString()
    //       : "Non renseignée",
    //     dateFin: contrat.dateFin
    //       ? new Date(contrat.dateFin).toLocaleDateString()
    //       : "Non renseignée",
    //     salaire: contrat.salaire ? `${contrat.salaire} €` : "Non renseigné",
    //     matricule: contrat.matricule ?? "Non renseigné",
    //     actionUrl: `${process.env.APP_URL}/accueil`,
    //     currentYear: new Date().getFullYear(),
    //     subject: "Contrat de travail à signer",
    //   },
    // });

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

  // ADD CONTRACT - MONDIAL TV CDI -----------------------------------------------------------
  @Post("mt")
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
  async createMT(
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
      const pdfBufferNonSignerCdiWC =
        await this.generator.generateMondialTVCDIContract(createContratDto);

      // Upload merged PDF to S3
      fichierContratNonSignerPdf = await this.uploadFileUseCase.execute(
        pdfBufferNonSignerCdiWC,
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
      templateId: "d-68cb24823d8d4e1c8d62ee0e7f78e223",
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
}
