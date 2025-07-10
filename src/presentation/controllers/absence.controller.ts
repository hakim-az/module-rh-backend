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
  ValidationPipe,
} from "@nestjs/common";
import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { CreateAbsenceUseCase } from "@application/use-cases/absence/create-absence.use-case";
import { GetAbsencesByUserUseCase } from "@application/use-cases/absence/get-absences-by-user.use-case";
import { DeleteAbsenceUseCase } from "@application/use-cases/absence/delete-absence.use-case";
import { UploadFileUseCase } from "@application/use-cases/file/upload-file.use-case";
import {
  CreateAbsenceDto,
  AbsenceResponseDto,
  UpdateAbsenceDto,
} from "@application/dtos/absence.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UpdateAbsenceUseCase } from "@/application/use-cases/absence/update-absence.use-case";
import { GetAllAbsencesUseCase } from "@/application/use-cases/absence/get-all-absences.use-case";
import { GetAbsenceUseCase } from "@/application/use-cases/absence/get-absence.use-case";

@ApiTags("absences")
@Controller("absences")
export class AbsenceController {
  constructor(
    private readonly createAbsenceUseCase: CreateAbsenceUseCase,
    private readonly getAbsencesByUserUseCase: GetAbsencesByUserUseCase,
    private readonly deleteAbsenceUseCase: DeleteAbsenceUseCase,
    private readonly updateAbsenceUseCase: UpdateAbsenceUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly getAllAbsencesUseCase: GetAllAbsencesUseCase,
    private readonly getAbsenceUseCase: GetAbsenceUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all absences" })
  @ApiResponse({
    status: 200,
    description: "Absences retrieved successfully",
    type: [AbsenceResponseDto],
  })
  async findAll(): Promise<AbsenceResponseDto[]> {
    try {
      const absences = await this.getAllAbsencesUseCase.execute();
      return absences.map((absence) => ({
        id: absence.id,
        idUser: absence.idUser,
        typeAbsence: absence.typeAbsence,
        dateDebut: absence.dateDebut?.toISOString(),
        dateFin: absence.dateFin?.toISOString(),
        note: absence.note,
        statut: absence.statut,
        motifDeRefus: absence.motifDeRefus,
        fichierJustificatifPdf: absence.fichierJustificatifPdf ?? "",
        createdAt: absence.createdAt?.toISOString(),
        updatedAt: absence.updatedAt?.toISOString(),
      }));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single absence by ID" })
  @ApiResponse({
    status: 200,
    description: "Absence retrieved successfully",
    type: AbsenceResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<AbsenceResponseDto> {
    try {
      const absence = await this.getAbsenceUseCase.execute(id);
      if (!absence) {
        throw new HttpException("Absence not found", HttpStatus.NOT_FOUND);
      }
      return {
        id: absence.id,
        idUser: absence.idUser,
        typeAbsence: absence.typeAbsence,
        dateDebut: absence.dateDebut?.toISOString(),
        dateFin: absence.dateFin?.toISOString(),
        note: absence.note,
        statut: absence.statut,
        motifDeRefus: absence.motifDeRefus,
        fichierJustificatifPdf: absence.fichierJustificatifPdf ?? "",
        createdAt: absence.createdAt?.toISOString(),
        updatedAt: absence.updatedAt?.toISOString(),
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
    summary: "Create an absence with optional justification file",
  })
  @ApiResponse({ status: 201, description: "Absence created successfully" })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAbsenceDto: CreateAbsenceDto
  ): Promise<AbsenceResponseDto> {
    let fichierJustificatifPdf = createAbsenceDto.fichierJustificatifPdf ?? "";

    if (file) {
      fichierJustificatifPdf = await this.uploadFileUseCase.execute(
        file.buffer,
        file.originalname,
        file.mimetype
      );
    }

    const absence = await this.createAbsenceUseCase.execute({
      ...createAbsenceDto,
      fichierJustificatifPdf,
    });

    return {
      id: absence.id,
      idUser: absence.idUser,
      typeAbsence: absence.typeAbsence,
      dateDebut: absence.dateDebut?.toISOString(),
      dateFin: absence.dateFin?.toISOString(),
      note: absence.note,
      statut: absence.statut,
      motifDeRefus: absence.motifDeRefus,
      fichierJustificatifPdf: absence.fichierJustificatifPdf ?? "",
      createdAt: absence.createdAt?.toISOString(),
      updatedAt: absence.updatedAt?.toISOString(),
    };
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get absences by user ID" })
  @ApiResponse({ status: 200, description: "Absences retrieved successfully" })
  async findByUser(
    @Param("userId") userId: string
  ): Promise<AbsenceResponseDto[]> {
    const absences = await this.getAbsencesByUserUseCase.execute(userId);
    return absences.map((absence) => ({
      id: absence.id,
      idUser: absence.idUser,
      typeAbsence: absence.typeAbsence,
      dateDebut: absence.dateDebut?.toISOString(),
      dateFin: absence.dateFin?.toISOString(),
      note: absence.note,
      statut: absence.statut,
      motifDeRefus: absence.motifDeRefus,
      fichierJustificatifPdf: absence.fichierJustificatifPdf ?? "",
      createdAt: absence.createdAt?.toISOString(),
      updatedAt: absence.updatedAt?.toISOString(),
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
  @ApiOperation({ summary: "Update an absence" })
  @ApiResponse({ status: 200, description: "Absence updated successfully" })
  async update(
    @Param("id") id: string,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Body() updateAbsenceDto: UpdateAbsenceDto
  ): Promise<AbsenceResponseDto> {
    const fileMap = Object.fromEntries(
      (files ?? []).map((f) => [f.fieldname, f])
    );

    if (fileMap["fichierJustificatifPdf"]) {
      const fileName = await this.uploadFileUseCase.execute(
        fileMap["fichierJustificatifPdf"].buffer,
        fileMap["fichierJustificatifPdf"].originalname,
        fileMap["fichierJustificatifPdf"].mimetype
      );
      updateAbsenceDto.fichierJustificatifPdf = fileName;
    }

    const absence = await this.updateAbsenceUseCase.execute(
      id,
      updateAbsenceDto
    );

    return {
      id: absence.id,
      idUser: absence.idUser,
      typeAbsence: absence.typeAbsence,
      dateDebut: absence.dateDebut?.toISOString(),
      dateFin: absence.dateFin?.toISOString(),
      note: absence.note,
      statut: absence.statut,
      motifDeRefus: absence.motifDeRefus,
      fichierJustificatifPdf: absence.fichierJustificatifPdf ?? "",
      createdAt: absence.createdAt?.toISOString(),
      updatedAt: absence.updatedAt?.toISOString(),
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an absence" })
  @ApiResponse({ status: 200, description: "Absence deleted successfully" })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    await this.deleteAbsenceUseCase.execute(id);
    return { message: "Absence deleted successfully" };
  }
}
