import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Patch,
  UploadedFiles,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor, AnyFilesInterceptor } from "@nestjs/platform-express";
import { CreateCoffreUseCase } from "@application/use-cases/coffre/create-coffre.use-case";
import { GetCoffresByUserUseCase } from "@application/use-cases/coffre/get-coffres-by-user.use-case";
import { DeleteCoffreUseCase } from "@application/use-cases/coffre/delete-coffre.use-case";
import { UploadFileUseCase } from "@application/use-cases/file/upload-file.use-case";
import {
  CreateCoffreDto,
  CoffreResponseDto,
  UpdateCoffreDto,
} from "@application/dtos/coffre.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UpdateCoffreUseCase } from "@/application/use-cases/coffre/update-coffre.use-case";
import { GetAllCoffresUseCase } from "@/application/use-cases/coffre/get-all-coffres.use-case";
import { GetCoffreUseCase } from "@/application/use-cases/coffre/get-coffre.use-case";
import { KeycloakAuthGuard } from "@/application/auth/keycloak-auth.guard";
import { GroupsGuard } from "@/application/auth/groups.guard";
import { Groups } from "@/application/auth/groups.decorator";

@ApiTags("coffres")
@ApiBearerAuth()
@Controller("coffres")
@UseGuards(KeycloakAuthGuard)
export class CoffreController {
  constructor(
    private readonly createCoffreUseCase: CreateCoffreUseCase,
    private readonly getCoffresByUserUseCase: GetCoffresByUserUseCase,
    private readonly deleteCoffreUseCase: DeleteCoffreUseCase,
    private readonly updateCoffreUseCase: UpdateCoffreUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly getAllCoffresUseCase: GetAllCoffresUseCase,
    private readonly getCoffreUseCase: GetCoffreUseCase
  ) {}

  // GET COFFRE ALL ----------------------------------------------------------------------------------------------
  @Get()
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Admin")
  @ApiOperation({ summary: "Get all coffres" })
  @ApiResponse({
    status: 200,
    description: "Coffres retrieved successfully",
    type: [CoffreResponseDto],
  })
  async findAll(): Promise<CoffreResponseDto[]> {
    try {
      const coffres = await this.getAllCoffresUseCase.execute();

      // Sort by createdAt descending
      const sortedCoffres = coffres.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      return sortedCoffres.map((coffre) => ({
        id: coffre.id,
        idUser: coffre.idUser,
        typeBulletin: coffre.typeBulletin,
        mois: coffre.mois,
        annee: coffre.annee,
        note: coffre.note,
        fichierJustificatifPdf: coffre.fichierJustificatifPdf ?? "",
        createdAt: coffre.createdAt?.toISOString(),
        updatedAt: coffre.updatedAt?.toISOString(),
        user: coffre.user
          ? {
              nomDeNaissance: coffre.user.nomDeNaissance,
              prenom: coffre.user.prenom,
              emailProfessionnel: coffre.user.emailProfessionnel,
              avatar: coffre.user.avatar,
            }
          : undefined,
      }));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET COFFRE BY ID ----------------------------------------------------------------------------------------------
  @Get(":id")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Admin")
  @ApiOperation({ summary: "Get a single coffre by ID" })
  @ApiResponse({
    status: 200,
    description: "Coffre retrieved successfully",
    type: CoffreResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<CoffreResponseDto> {
    try {
      const coffre = await this.getCoffreUseCase.execute(id);
      if (!coffre) {
        throw new HttpException("Coffre not found", HttpStatus.NOT_FOUND);
      }
      return {
        id: coffre.id,
        idUser: coffre.idUser,
        typeBulletin: coffre.typeBulletin,
        mois: coffre.mois,
        annee: coffre.annee,
        note: coffre.note,
        fichierJustificatifPdf: coffre.fichierJustificatifPdf ?? "",
        createdAt: coffre.createdAt?.toISOString(),
        updatedAt: coffre.updatedAt?.toISOString(),
        user: coffre.user
          ? {
              nomDeNaissance: coffre.user.nomDeNaissance,
              prenom: coffre.user.prenom,
              emailProfessionnel: coffre.user.emailProfessionnel,
              avatar: coffre.user.avatar,
            }
          : undefined,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // ADD COFFRE  ----------------------------------------------------------------------------------------------
  @Post()
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Admin")
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
  @ApiOperation({
    summary: "Create a coffre with optional justification file",
  })
  @ApiResponse({ status: 201, description: "Coffre created successfully" })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCoffreDto: CreateCoffreDto
  ): Promise<CoffreResponseDto> {
    let fichierJustificatifPdf = createCoffreDto.fichierJustificatifPdf ?? "";

    if (file) {
      fichierJustificatifPdf = await this.uploadFileUseCase.execute(
        file.buffer,
        file.originalname,
        file.mimetype
      );
    }

    const coffre = await this.createCoffreUseCase.execute({
      ...createCoffreDto,
      fichierJustificatifPdf,
    });

    return {
      id: coffre.id,
      idUser: coffre.idUser,
      typeBulletin: coffre.typeBulletin,
      mois: coffre.mois,
      annee: coffre.annee,
      note: coffre.note,
      fichierJustificatifPdf: coffre.fichierJustificatifPdf ?? "",
      createdAt: coffre.createdAt?.toISOString(),
      updatedAt: coffre.updatedAt?.toISOString(),
      user: coffre.user
        ? {
            nomDeNaissance: coffre.user.nomDeNaissance,
            prenom: coffre.user.prenom,
            emailProfessionnel: coffre.user.emailProfessionnel,
            avatar: coffre.user.avatar,
          }
        : undefined,
    };
  }

  // GET COFFRE BY USER ID ----------------------------------------------------------------------------------------------
  @Get("user/:userId")
  @UseGuards(GroupsGuard)
  @Groups(
    "RH-Manager",
    "RH-Admin",
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
  @ApiOperation({ summary: "Get coffres by user ID" })
  @ApiResponse({ status: 200, description: "Coffres retrieved successfully" })
  async findByUser(
    @Param("userId") userId: string
  ): Promise<CoffreResponseDto[]> {
    const coffres = await this.getCoffresByUserUseCase.execute(userId);

    // Sort coffres by createdAt descending (most recent first)
    const sortedCoffres = coffres.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return sortedCoffres.map((coffre) => ({
      id: coffre.id,
      idUser: coffre.idUser,
      typeBulletin: coffre.typeBulletin,
      mois: coffre.mois,
      annee: coffre.annee,
      note: coffre.note,
      fichierJustificatifPdf: coffre.fichierJustificatifPdf ?? "",
      createdAt: coffre.createdAt?.toISOString(),
      updatedAt: coffre.updatedAt?.toISOString(),
      user: coffre.user
        ? {
            nomDeNaissance: coffre.user.nomDeNaissance,
            prenom: coffre.user.prenom,
            emailProfessionnel: coffre.user.emailProfessionnel,
            avatar: coffre.user.avatar,
          }
        : undefined,
    }));
  }

  // UPDATE COFFRE BY ID ----------------------------------------------------------------------------------------------
  @Patch(":id")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Admin")
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
  @ApiOperation({ summary: "Update a coffre" })
  @ApiResponse({ status: 200, description: "Coffre updated successfully" })
  async update(
    @Param("id") id: string,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Body() updateCoffreDto: UpdateCoffreDto
  ): Promise<CoffreResponseDto> {
    const fileMap = Object.fromEntries(
      (files ?? []).map((f) => [f.fieldname, f])
    );

    if (fileMap["fichierJustificatifPdf"]) {
      const fileName = await this.uploadFileUseCase.execute(
        fileMap["fichierJustificatifPdf"].buffer,
        fileMap["fichierJustificatifPdf"].originalname,
        fileMap["fichierJustificatifPdf"].mimetype
      );
      updateCoffreDto.fichierJustificatifPdf = fileName;
    }

    const coffre = await this.updateCoffreUseCase.execute(id, updateCoffreDto);

    return {
      id: coffre.id,
      idUser: coffre.idUser,
      typeBulletin: coffre.typeBulletin,
      mois: coffre.mois,
      annee: coffre.annee,
      note: coffre.note,
      fichierJustificatifPdf: coffre.fichierJustificatifPdf ?? "",
      createdAt: coffre.createdAt?.toISOString(),
      updatedAt: coffre.updatedAt?.toISOString(),
      user: coffre.user
        ? {
            nomDeNaissance: coffre.user.nomDeNaissance,
            prenom: coffre.user.prenom,
            emailProfessionnel: coffre.user.emailProfessionnel,
            avatar: coffre.user.avatar,
          }
        : undefined,
    };
  }

  // DELETE COFFRE BY ID ----------------------------------------------------------------------------------------------
  @Delete(":id")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Admin")
  @ApiOperation({ summary: "Delete a coffre" })
  @ApiResponse({ status: 200, description: "Coffre deleted successfully" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.deleteCoffreUseCase.execute(id);
    return { message: "Coffre deleted successfully" };
  }
}
