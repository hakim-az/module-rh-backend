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
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UpdateCoffreUseCase } from "@/application/use-cases/coffre/update-coffre.use-case";
import { GetAllCoffresUseCase } from "@/application/use-cases/coffre/get-all-coffres.use-case";
import { GetCoffreUseCase } from "@/application/use-cases/coffre/get-coffre.use-case";

@ApiTags("coffres")
@Controller("coffres")
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

  @Get()
  @ApiOperation({ summary: "Get all coffres" })
  @ApiResponse({
    status: 200,
    description: "Coffres retrieved successfully",
    type: [CoffreResponseDto],
  })
  async findAll(): Promise<CoffreResponseDto[]> {
    try {
      const coffres = await this.getAllCoffresUseCase.execute();
      return coffres.map((coffre) => ({
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

  @Get(":id")
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

  @Post()
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

  @Get("user/:userId")
  @ApiOperation({ summary: "Get coffres by user ID" })
  @ApiResponse({ status: 200, description: "Coffres retrieved successfully" })
  async findByUser(
    @Param("userId") userId: string
  ): Promise<CoffreResponseDto[]> {
    const coffres = await this.getCoffresByUserUseCase.execute(userId);
    return coffres.map((coffre) => ({
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

  @Patch(":id")
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

  @Delete(":id")
  @ApiOperation({ summary: "Delete a coffre" })
  @ApiResponse({ status: 200, description: "Coffre deleted successfully" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.deleteCoffreUseCase.execute(id);
    return { message: "Coffre deleted successfully" };
  }
}
