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
    private readonly updateUserUseCase: UpdateUserUseCase
  ) {}

  // ADD CONTRACT -----------------------------------------------------------
  @Post()
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin")
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
    let fichierContratNonSignerPdf =
      createContratDto.fichierContratNonSignerPdf ?? "";
    let fichierContratSignerPdf =
      createContratDto.fichierContratSignerPdf ?? "";

    if (files && Array.isArray(files)) {
      const fileMap = Object.fromEntries(files.map((f) => [f.fieldname, f]));

      if (fileMap["fichierContratNonSignerPdf"]) {
        fichierContratNonSignerPdf = await this.uploadFileUseCase.execute(
          fileMap["fichierContratNonSignerPdf"].buffer,
          fileMap["fichierContratNonSignerPdf"].originalname,
          fileMap["fichierContratNonSignerPdf"].mimetype
        );
      }

      if (fileMap["fichierContratSignerPdf"]) {
        fichierContratSignerPdf = await this.uploadFileUseCase.execute(
          fileMap["fichierContratSignerPdf"].buffer,
          fileMap["fichierContratSignerPdf"].originalname,
          fileMap["fichierContratSignerPdf"].mimetype
        );
      }
    }

    const contratData = {
      ...createContratDto,
      fichierContratNonSignerPdf,
      fichierContratSignerPdf,
    };

    const contrat = await this.createContratUseCase.execute(contratData);

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
  @Groups("RH-Manager", "RH-Admin")
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
  @Groups("RH-Manager", "RH-Admin")
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
  @Groups("RH-Manager", "RH-Admin")
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
  @Groups("RH-Manager", "RH-Admin")
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
  @Groups("RH-Manager", "RH-Admin")
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
      await this.updateUserUseCase.execute(userId, {
        statut: "contract-signed",
      });

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
