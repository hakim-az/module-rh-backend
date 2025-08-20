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
import { GetContratUseCase } from "@/application/use-cases/contrat/get-contrat.use-case";

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
    private readonly getAbsenceUseCase: GetAbsenceUseCase,
    private readonly getContratUseCase: GetContratUseCase
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

        // ✅ Calculer le total en tenant compte de partieDeJour
        let total: number = 0;
        if (dateDebut && dateFin) {
          // Comparer directement les dates au format ISO string (même jour)
          const dateDebutStr = dateDebut.toISOString().split("T")[0]; // YYYY-MM-DD
          const dateFinStr = dateFin.toISOString().split("T")[0]; // YYYY-MM-DD
          const isSameDay = dateDebutStr === dateFinStr;

          if (isSameDay) {
            // Même jour : calculer selon partieDeJour
            switch (absence.partieDeJour) {
              case "matin":
              case "apres_midi":
                total = 0.5;
                break;
              case "journee_entiereeee":
                total = 1.0;
                break;
              default:
                total = 5.0; // fallback pour les autres valeurs
                break;
            }
          } else {
            // Dates différentes : calculer les jours ouvrés normalement
            total = countBusinessDays(dateDebut, dateFin);
          }
        }

        return {
          id: absence.id,
          idUser: absence.idUser,
          typeAbsence: absence.typeAbsence,
          dateDebut: dateDebut?.toISOString(),
          dateFin: dateFin?.toISOString(),
          partieDeJour: absence.partieDeJour,
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
          total: Number(total), // ✅ S'assurer que c'est un number (float)
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

  @Get("calculate-holidays/:userId")
  @ApiOperation({
    summary: "Calculate remaining holiday days for an employee",
  })
  @ApiResponse({
    status: 200,
    description: "Holiday days calculated successfully",
    schema: {
      example: {
        earnedDays: 12.48,
        usedDays: 5,
        remainingDays: 7.48,
      },
    },
  })
  async calculateHolidays(
    @Param("userId") userId: string,
    @Query("entryDate") entryDateStr: string,
    @Query("currentDate") currentDateStr?: string
  ): Promise<{ earnedDays: number; usedDays: number; remainingDays: number }> {
    try {
      if (!entryDateStr) {
        throw new HttpException(
          "entryDate query parameter is required (YYYY-MM-DD)",
          HttpStatus.BAD_REQUEST
        );
      }

      const entryDate = new Date(entryDateStr);
      if (isNaN(entryDate.getTime())) {
        throw new HttpException(
          "Invalid entryDate format",
          HttpStatus.BAD_REQUEST
        );
      }

      const currentDate = currentDateStr
        ? new Date(currentDateStr)
        : new Date();
      if (isNaN(currentDate.getTime())) {
        throw new HttpException(
          "Invalid currentDate format",
          HttpStatus.BAD_REQUEST
        );
      }

      if (currentDate < entryDate) {
        // If current date is before entry date, no days earned
        return { earnedDays: 0, usedDays: 0, remainingDays: 0 };
      }

      // Helper function to get days in a month
      function daysInMonth(year: number, month: number) {
        return new Date(year, month + 1, 0).getDate();
      }

      // Calculate earned days

      // 1. Calculate partial days in the first month
      const startMonthDays = daysInMonth(
        entryDate.getFullYear(),
        entryDate.getMonth()
      );
      const daysWorkedInFirstMonth = startMonthDays - entryDate.getDate() + 1;
      const partialFirstMonthEarned =
        (daysWorkedInFirstMonth / startMonthDays) * 2.08;

      // 2. Calculate number of full months after the first partial month
      // Full months count from the first day of the next month after entryDate
      const firstFullMonthStart = new Date(
        entryDate.getFullYear(),
        entryDate.getMonth() + 1,
        1
      );

      // Calculate months difference between first full month and currentDate (full months only)
      let fullMonths = 0;
      if (currentDate >= firstFullMonthStart) {
        fullMonths =
          (currentDate.getFullYear() - firstFullMonthStart.getFullYear()) * 12 +
          (currentDate.getMonth() - firstFullMonthStart.getMonth());

        // If currentDate's day is less than the first of the next month, we don't count the last month fully
        // But since fullMonths is counting full months completed, we just keep it as is (no partial prorate for end)
        if (currentDate.getDate() < 1) {
          fullMonths -= 1; // but this case is impossible since day < 1 never true, so can skip
        }

        if (fullMonths < 0) fullMonths = 0;
      }

      // 3. Calculate earned days for full months
      const fullMonthsEarned = fullMonths * 2.08;

      // 4. Sum partial first month + full months
      let earnedDays = partialFirstMonthEarned + fullMonthsEarned;

      // Round to 2 decimals
      earnedDays = +earnedDays.toFixed(2);

      // Calculate used days as before (your original code)
      const absences = await this.getAbsencesByUserUseCase.execute(userId);
      const usedDays = absences
        .filter((a) => a.statut === "approuver")
        .reduce((sum, absence) => {
          const dateDebut = absence.dateDebut
            ? new Date(absence.dateDebut)
            : null;
          const dateFin = absence.dateFin ? new Date(absence.dateFin) : null;
          if (!dateDebut || !dateFin) return sum;

          // Count only if after entry date
          if (dateFin < entryDate) return sum;

          const start = dateDebut < entryDate ? entryDate : dateDebut;
          const joursOuvres = countBusinessDays(start, dateFin);
          return sum + joursOuvres;
        }, 0);

      const remainingDays = +(earnedDays - usedDays).toFixed(2);

      return {
        earnedDays,
        usedDays,
        remainingDays: remainingDays < 0 ? 0 : remainingDays,
      };
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to calculate holidays",
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

  // @Get("holidays-cumulative")
  // @ApiOperation({
  //   summary:
  //     "Calcule les congés cumulés depuis le début du contrat jusqu'à une date donnée",
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: "Congés calculés avec succès",
  // })
  // async calculateHolidaysCumulative(
  //   @Query("userId") userId: string,
  //   @Query("dateDebut") dateDebutStr: string,
  //   @Query("dateFin") dateFinStr: string
  // ): Promise<any> {
  //   if (!userId || !dateDebutStr || !dateFinStr) {
  //     throw new HttpException(
  //       "userId, dateDebut et dateFin sont requis (YYYY-MM-DD)",
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }

  //   const dateDebut = new Date(dateDebutStr);
  //   const dateFin = new Date(dateFinStr);

  //   if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
  //     throw new HttpException("Dates invalides", HttpStatus.BAD_REQUEST);
  //   }

  //   if (dateFin < dateDebut) {
  //     throw new HttpException(
  //       "dateFin doit être >= dateDebut",
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }

  //   // 🔹 Détermination de la période de référence actuelle (1er juin → 31 mai)
  //   const refYear =
  //     dateFin.getMonth() + 1 >= 6
  //       ? dateFin.getFullYear()
  //       : dateFin.getFullYear() - 1;
  //   const periodeDebut = new Date(refYear, 5, 1); // 1 juin
  //   const periodeFin = new Date(refYear + 1, 4, 31); // 31 mai

  //   // 🔹 Helper pour prorata du mois
  //   const prorataMois = (d1: Date, d2: Date) => {
  //     const daysInMonth = new Date(
  //       d1.getFullYear(),
  //       d1.getMonth() + 1,
  //       0
  //     ).getDate();
  //     const joursTravailles = d2.getDate() - d1.getDate() + 1;
  //     return +((joursTravailles / daysInMonth) * 2.0833).toFixed(2);
  //   };

  //   // 🔹 Calcul total acquis depuis le début du contrat
  //   let totalAcquisDepuisDebut = 0;
  //   let current = new Date(dateDebut);
  //   while (current <= dateFin) {
  //     const monthEnd = new Date(
  //       current.getFullYear(),
  //       current.getMonth() + 1,
  //       0
  //     );
  //     const end = monthEnd < dateFin ? monthEnd : dateFin;
  //     totalAcquisDepuisDebut += prorataMois(current, end);
  //     current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  //   }
  //   totalAcquisDepuisDebut = +totalAcquisDepuisDebut.toFixed(2);

  //   // 🔹 Calcul acquis dans la période actuelle (1er juin → 31 mai)
  //   let startAcquis = periodeDebut > dateDebut ? periodeDebut : dateDebut;
  //   let currentAcquis = new Date(startAcquis);
  //   let acquis = 0;
  //   while (currentAcquis <= dateFin && currentAcquis <= periodeFin) {
  //     const monthEnd = new Date(
  //       currentAcquis.getFullYear(),
  //       currentAcquis.getMonth() + 1,
  //       0
  //     );
  //     const end = monthEnd < dateFin ? monthEnd : dateFin;
  //     acquis += prorataMois(currentAcquis, end);
  //     currentAcquis = new Date(
  //       currentAcquis.getFullYear(),
  //       currentAcquis.getMonth() + 1,
  //       1
  //     );
  //   }
  //   acquis = +acquis.toFixed(2);

  //   // 🔹 Calcul des jours consommés
  //   const typesAExclure = ["conge_parental", "mise_a_pied", "conge_sans_solde"];
  //   const absences = await this.getAbsencesByUserUseCase.execute(userId);

  //   // Consommés dans la période actuelle (1er juin → 31 mai)
  //   const consommes = absences
  //     .filter(
  //       (a) =>
  //         a.statut === "approuver" &&
  //         !typesAExclure.includes(a.typeAbsence) &&
  //         a.fichierJustificatifPdf !== "" &&
  //         a.dateDebut &&
  //         a.dateFin
  //     )
  //     .reduce((sum, absence) => {
  //       const d1 = new Date(absence.dateDebut);
  //       const d2 = new Date(absence.dateFin);

  //       // Calcul intersection avec la période actuelle
  //       const start = d1 < periodeDebut ? periodeDebut : d1;
  //       const end = d2 > periodeFin ? periodeFin : d2;
  //       if (start > end) return sum;

  //       return sum + countBusinessDays(start, end);
  //     }, 0);

  //   // 🔹 Total consommés depuis le début du contrat
  //   const totalConsommesDepuisDebut = absences
  //     .filter(
  //       (a) =>
  //         a.statut === "approuver" &&
  //         !typesAExclure.includes(a.typeAbsence) &&
  //         a.fichierJustificatifPdf !== "" &&
  //         a.dateDebut &&
  //         a.dateFin
  //     )
  //     .reduce((sum, absence) => {
  //       const d1 = new Date(absence.dateDebut);
  //       const d2 = new Date(absence.dateFin);
  //       return sum + countBusinessDays(d1, d2);
  //     }, 0);

  //   const restants = +(acquis - consommes).toFixed(2);

  //   return {
  //     periodeReference: `${periodeDebut.toISOString().split("T")[0]} au ${
  //       periodeFin.toISOString().split("T")[0]
  //     }`,
  //     acquis,
  //     consommes,
  //     restants,
  //     totalAcquisDepuisDebut,
  //     totalConsommesDepuisDebut,
  //   };
  // }

  @Get("holidays-cumulative")
  @ApiOperation({
    summary:
      "Calcule les congés cumulés depuis le début du contrat jusqu'à une date donnée",
  })
  @ApiResponse({
    status: 200,
    description: "Congés calculés avec succès",
  })
  async calculateHolidaysCumulative(
    @Query("userId") userId: string,
    @Query("dateDebut") dateDebutStr: string,
    @Query("dateFin") dateFinStr: string
  ): Promise<any> {
    if (!userId || !dateDebutStr || !dateFinStr) {
      throw new HttpException(
        "userId, dateDebut et dateFin sont requis (YYYY-MM-DD)",
        HttpStatus.BAD_REQUEST
      );
    }

    const dateDebut = new Date(dateDebutStr);
    const dateFin = new Date(dateFinStr);

    if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
      throw new HttpException("Dates invalides", HttpStatus.BAD_REQUEST);
    }

    if (dateFin < dateDebut) {
      throw new HttpException(
        "dateFin doit être >= dateDebut",
        HttpStatus.BAD_REQUEST
      );
    }

    // 🔹 Détermination de la période de référence actuelle (1er juin → 31 mai)
    const refYear =
      dateFin.getMonth() + 1 >= 6
        ? dateFin.getFullYear()
        : dateFin.getFullYear() - 1;
    const periodeDebut = new Date(refYear, 5, 1); // 1 juin
    const periodeFin = new Date(refYear + 1, 4, 31); // 31 mai

    // 🔹 Helper pour prorata du mois
    const prorataMois = (d1: Date, d2: Date) => {
      const daysInMonth = new Date(
        d1.getFullYear(),
        d1.getMonth() + 1,
        0
      ).getDate();
      const joursTravailles = d2.getDate() - d1.getDate() + 1;
      return +((joursTravailles / daysInMonth) * 2.0833).toFixed(2);
    };

    // 🔹 Helper pour calculer les jours avec partieDeJour
    const calculateDaysWithPartieDeJour = (
      absence: any,
      startDate: Date,
      endDate: Date
    ): number => {
      const d1 = new Date(absence.dateDebut);
      const d2 = new Date(absence.dateFin);

      // Appliquer les limites de la période
      const start = d1 < startDate ? startDate : d1;
      const end = d2 > endDate ? endDate : d2;

      if (start > end) return 0;

      // Vérifier si c'est le même jour
      const startStr = start.toISOString().split("T")[0]; // YYYY-MM-DD
      const endStr = end.toISOString().split("T")[0]; // YYYY-MM-DD
      const isSameDay = startStr === endStr;

      if (isSameDay) {
        // Même jour : calculer selon partieDeJour
        switch (absence.partieDeJour) {
          case "matin":
          case "apres_midi":
            return 0.5;
          case "journee_entiere":
            return 1.0;
          default:
            return 1.0; // fallback
        }
      } else {
        // Dates différentes : calculer les jours ouvrés normalement
        return countBusinessDays(start, end);
      }
    };

    // 🔹 Calcul total acquis depuis le début du contrat
    let totalAcquisDepuisDebut = 0;
    let current = new Date(dateDebut);
    while (current <= dateFin) {
      const monthEnd = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        0
      );
      const end = monthEnd < dateFin ? monthEnd : dateFin;
      totalAcquisDepuisDebut += prorataMois(current, end);
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
    totalAcquisDepuisDebut = +totalAcquisDepuisDebut.toFixed(2);

    // 🔹 Calcul acquis dans la période actuelle (1er juin → 31 mai)
    let startAcquis = periodeDebut > dateDebut ? periodeDebut : dateDebut;
    let currentAcquis = new Date(startAcquis);
    let acquis = 0;
    while (currentAcquis <= dateFin && currentAcquis <= periodeFin) {
      const monthEnd = new Date(
        currentAcquis.getFullYear(),
        currentAcquis.getMonth() + 1,
        0
      );
      const end = monthEnd < dateFin ? monthEnd : dateFin;
      acquis += prorataMois(currentAcquis, end);
      currentAcquis = new Date(
        currentAcquis.getFullYear(),
        currentAcquis.getMonth() + 1,
        1
      );
    }
    acquis = +acquis.toFixed(2);

    // 🔹 Calcul des jours consommés
    const typesAExclure = ["conge_parental", "mise_a_pied", "conge_sans_solde"];
    const absences = await this.getAbsencesByUserUseCase.execute(userId);

    // ✅ Consommés dans la période actuelle (1er juin → 31 mai) avec partieDeJour
    const consommes = absences
      .filter(
        (a) =>
          a.statut === "approuver" &&
          !typesAExclure.includes(a.typeAbsence) &&
          a.fichierJustificatifPdf !== "" &&
          a.dateDebut &&
          a.dateFin
      )
      .reduce((sum, absence) => {
        return (
          sum + calculateDaysWithPartieDeJour(absence, periodeDebut, periodeFin)
        );
      }, 0);

    // ✅ Total consommés depuis le début du contrat avec partieDeJour
    const totalConsommesDepuisDebut = absences
      .filter(
        (a) =>
          a.statut === "approuver" &&
          !typesAExclure.includes(a.typeAbsence) &&
          a.fichierJustificatifPdf !== "" &&
          a.dateDebut &&
          a.dateFin
      )
      .reduce((sum, absence) => {
        return sum + calculateDaysWithPartieDeJour(absence, dateDebut, dateFin);
      }, 0);

    const restants = +(acquis - consommes).toFixed(2);

    return {
      periodeReference: `${periodeDebut.toISOString().split("T")[0]} au ${
        periodeFin.toISOString().split("T")[0]
      }`,
      acquis,
      consommes,
      restants,
      totalAcquisDepuisDebut,
      totalConsommesDepuisDebut,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single absence by ID" })
  @ApiResponse({
    status: 200,
    description: "Absence retrieved successfully",
    type: AbsenceResponseDto,
  })
  async findOne(
    @Param("id") id: string
  ): Promise<AbsenceResponseDto & { total: number }> {
    try {
      const absence = await this.getAbsenceUseCase.execute(id);
      if (!absence) {
        throw new HttpException("Absence not found", HttpStatus.NOT_FOUND);
      }

      const dateDebut = absence.dateDebut ? new Date(absence.dateDebut) : null;
      const dateFin = absence.dateFin ? new Date(absence.dateFin) : null;

      // ✅ Calculer le total en tenant compte de partieDeJour
      let total: number = 0;
      if (dateDebut && dateFin) {
        // Comparer directement les dates au format ISO string (même jour)
        const dateDebutStr = dateDebut.toISOString().split("T")[0]; // YYYY-MM-DD
        const dateFinStr = dateFin.toISOString().split("T")[0]; // YYYY-MM-DD
        const isSameDay = dateDebutStr === dateFinStr;

        if (isSameDay) {
          // Même jour : calculer selon partieDeJour
          switch (absence.partieDeJour) {
            case "matin":
            case "apres_midi":
              total = 0.5;
              break;
            case "journee_entiere":
              total = 1.0;
              break;
            default:
              total = 1.0; // fallback pour les autres valeurs
              break;
          }
        } else {
          // Dates différentes : calculer les jours ouvrés normalement
          total = countBusinessDays(dateDebut, dateFin);
        }
      }

      return {
        id: absence.id,
        idUser: absence.idUser,
        typeAbsence: absence.typeAbsence,
        dateDebut: absence.dateDebut?.toISOString(),
        dateFin: absence.dateFin?.toISOString(),
        partieDeJour: absence.partieDeJour,
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
        total: Number(total), // ✅ S'assurer que c'est un number (float)
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
      partieDeJour: absence.partieDeJour,
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

      // ✅ Calculer le total en tenant compte de partieDeJour
      let total: number = 0;
      if (dateDebut && dateFin) {
        // Comparer directement les dates au format ISO string (même jour)
        const dateDebutStr = dateDebut.toISOString().split("T")[0]; // YYYY-MM-DD
        const dateFinStr = dateFin.toISOString().split("T")[0]; // YYYY-MM-DD
        const isSameDay = dateDebutStr === dateFinStr;

        if (isSameDay) {
          // Même jour : calculer selon partieDeJour
          switch (absence.partieDeJour) {
            case "matin":
            case "apres_midi":
              total = 0.5;
              break;
            case "journee_entiere":
              total = 1.0;
              break;
            default:
              total = 1.0; // fallback pour les autres valeurs
              break;
          }
        } else {
          // Dates différentes : calculer les jours ouvrés normalement
          total = countBusinessDays(dateDebut, dateFin);
        }
      }

      return {
        id: absence.id,
        idUser: absence.idUser,
        typeAbsence: absence.typeAbsence,
        dateDebut: dateDebut?.toISOString(),
        dateFin: dateFin?.toISOString(),
        partieDeJour: absence.partieDeJour,
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
        total: Number(total), // ✅ S'assurer que c'est un number (float)
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
      partieDeJour: absence.partieDeJour,
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
