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
  Query,
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
import { countBusinessDays } from "@/domain/services/count-business-days.service";

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
  async findAll(): Promise<(AbsenceResponseDto & { total: number })[]> {
    try {
      const absences = await this.getAllAbsencesUseCase.execute();

      // Sort absences by createdAt descending (recent first)
      const sortedAbsences = absences.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      return sortedAbsences.map((absence) => {
        const dateDebut = absence.dateDebut
          ? new Date(absence.dateDebut)
          : null;
        const dateFin = absence.dateFin ? new Date(absence.dateFin) : null;

        // ✅ Calculer le total sans week-ends
        let total = 0;
        if (dateDebut && dateFin) {
          total = countBusinessDays(dateDebut, dateFin);
        }

        return {
          id: absence.id,
          idUser: absence.idUser,
          typeAbsence: absence.typeAbsence,
          dateDebut: dateDebut?.toISOString(),
          dateFin: dateFin?.toISOString(),
          note: absence.note,
          statut: absence.statut,
          motifDeRefus: absence.motifDeRefus,
          fichierJustificatifPdf: absence.fichierJustificatifPdf ?? "",
          createdAt: absence.createdAt?.toISOString(),
          updatedAt: absence.updatedAt?.toISOString(),
          user: absence.user
            ? {
                nomDeNaissance: absence.user.nomDeNaissance,
                prenom: absence.user.prenom,
                emailProfessionnel: absence.user.emailProfessionnel,
                avatar: absence.user.avatar,
              }
            : undefined,
          total, // ✅ nombre de jours ouvrés uniquement
        };
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("totals-by-status")
  @ApiOperation({ summary: "Get total absences grouped by status" })
  @ApiResponse({
    status: 200,
    description: "Absence totals retrieved successfully",
    schema: {
      example: {
        approuver: 5,
        "en-attente": 3,
        refuser: 2,
      },
    },
  })
  async getAbsenceTotalsByStatus(): Promise<Record<string, number>> {
    try {
      const absences = await this.getAllAbsencesUseCase.execute();

      // ✅ Initialize with default statuses
      const statusTotals: Record<string, number> = {
        approuver: 0,
        "en-attente": 0,
        refuser: 0,
      };

      for (const absence of absences) {
        const status = absence.statut;
        if (status && statusTotals.hasOwnProperty(status)) {
          statusTotals[status]++;
        }
      }

      return statusTotals;
    } catch (error) {
      throw new HttpException(
        "Failed to retrieve absence totals",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("user/:userId/totals-by-status")
  @ApiOperation({ summary: "Get total absences by status for a specific user" })
  @ApiResponse({
    status: 200,
    description: "Absence totals by status retrieved successfully",
    schema: {
      example: {
        approuver: 3,
        "en-attente": 1,
        refuser: 0,
      },
    },
  })
  async getAbsenceTotalsByStatusForUser(
    @Param("userId") userId: string
  ): Promise<Record<string, number>> {
    try {
      const absences = await this.getAbsencesByUserUseCase.execute(userId);

      const statusTotals: Record<string, number> = {
        approuver: 0,
        "en-attente": 0,
        refuser: 0,
      };

      for (const absence of absences) {
        const status = absence.statut;
        if (status && statusTotals.hasOwnProperty(status)) {
          statusTotals[status]++;
        }
      }

      return statusTotals;
    } catch (error) {
      throw new HttpException(
        "Failed to retrieve absence totals for user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("total-conge/:userId")
  @ApiOperation({
    summary:
      "Get total approved absence days for a specific user, optionally filtered by month and year",
  })
  @ApiResponse({
    status: 200,
    description: "Total approved absence days retrieved successfully",
    schema: {
      example: {
        totalCongeApprouve: 12,
      },
    },
  })
  async getTotalCongeApprouveByUser(
    @Param("userId") userId: string,
    @Query("month") month?: string,
    @Query("year") year?: string
  ): Promise<{ totalCongeApprouve: number }> {
    try {
      const absences = await this.getAbsencesByUserUseCase.execute(userId);

      const totalCongeApprouve = absences
        .filter((a) => a.statut === "approuver")
        .reduce((sum, absence) => {
          const dateDebut = absence.dateDebut
            ? new Date(absence.dateDebut)
            : null;
          const dateFin = absence.dateFin ? new Date(absence.dateFin) : null;

          if (!dateDebut || !dateFin) return sum;

          // If month and year are provided, check if the absence overlaps with that month
          if (month && year) {
            const monthNum = parseInt(month, 10) - 1; // JS Date months are 0-based
            const yearNum = parseInt(year, 10);

            const startOfMonth = new Date(yearNum, monthNum, 1);
            const endOfMonth = new Date(yearNum, monthNum + 1, 0);

            // Compute the overlapping date range
            const overlapStart =
              dateDebut > startOfMonth ? dateDebut : startOfMonth;
            const overlapEnd = dateFin < endOfMonth ? dateFin : endOfMonth;

            if (overlapStart > overlapEnd) return sum; // No overlap

            const joursOuvres = countBusinessDays(overlapStart, overlapEnd);
            return sum + joursOuvres;
          } else {
            // No month/year filter → count full approved absence
            const joursOuvres = countBusinessDays(dateDebut, dateFin);
            return sum + joursOuvres;
          }
        }, 0);

      return { totalCongeApprouve };
    } catch (error) {
      throw new HttpException(
        "Failed to calculate approved absence total",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
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
        user: absence.user
          ? {
              nomDeNaissance: absence.user.nomDeNaissance,
              prenom: absence.user.prenom,
              emailProfessionnel: absence.user.emailProfessionnel,
              avatar: absence.user.avatar,
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
      user: absence.user
        ? {
            nomDeNaissance: absence.user.nomDeNaissance,
            prenom: absence.user.prenom,
            emailProfessionnel: absence.user.emailProfessionnel,
            avatar: absence.user.avatar,
          }
        : undefined,
    };
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get absences by user ID" })
  @ApiResponse({ status: 200, description: "Absences retrieved successfully" })
  async findByUser(
    @Param("userId") userId: string
  ): Promise<(AbsenceResponseDto & { total: number })[]> {
    const absences = await this.getAbsencesByUserUseCase.execute(userId);

    const sortedAbsences = absences.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return sortedAbsences.map((absence) => {
      const dateDebut = absence.dateDebut ? new Date(absence.dateDebut) : null;
      const dateFin = absence.dateFin ? new Date(absence.dateFin) : null;

      // ✅ Calculer total sans week-ends
      let total = 0;
      if (dateDebut && dateFin) {
        total = countBusinessDays(dateDebut, dateFin);
      }

      return {
        id: absence.id,
        idUser: absence.idUser,
        typeAbsence: absence.typeAbsence,
        dateDebut: dateDebut?.toISOString(),
        dateFin: dateFin?.toISOString(),
        note: absence.note,
        statut: absence.statut,
        motifDeRefus: absence.motifDeRefus,
        fichierJustificatifPdf: absence.fichierJustificatifPdf ?? "",
        createdAt: absence.createdAt?.toISOString(),
        updatedAt: absence.updatedAt?.toISOString(),
        user: absence.user
          ? {
              nomDeNaissance: absence.user.nomDeNaissance,
              prenom: absence.user.prenom,
              emailProfessionnel: absence.user.emailProfessionnel,
              avatar: absence.user.avatar,
            }
          : undefined,
        total, // ➕ jours ouvrés uniquement
      };
    });
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
      user: absence.user
        ? {
            nomDeNaissance: absence.user.nomDeNaissance,
            prenom: absence.user.prenom,
            emailProfessionnel: absence.user.emailProfessionnel,
            avatar: absence.user.avatar,
          }
        : undefined,
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
