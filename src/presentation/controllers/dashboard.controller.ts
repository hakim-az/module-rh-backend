import { GetAllAbsencesUseCase } from "@/application/use-cases/absence/get-all-absences.use-case";
import { GetAllCoffresUseCase } from "@/application/use-cases/coffre/get-all-coffres.use-case";
import { GetAllRestauxUseCase } from "@/application/use-cases/restau/get-all-restaux.use-case";
import { GetAllUsersUseCase } from "@/application/use-cases/user/get-all-users.use-case";
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Dashboard")
@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getAllAbsencesUseCase: GetAllAbsencesUseCase,
    private readonly getAllCoffresUseCase: GetAllCoffresUseCase,
    private readonly getAllRestauxUseCase: GetAllRestauxUseCase
  ) {}

  @Get()
  @ApiOperation({
    summary:
      "Get latest 5 records + totals for users, absences, coffres, and restaus",
  })
  @ApiResponse({
    status: 200,
    description: "Dashboard data retrieved successfully",
  })
  async getDashboard() {
    try {
      const [users, absences, coffres, restaus] = await Promise.all([
        this.getAllUsersUseCase.execute(),
        this.getAllAbsencesUseCase.execute(),
        this.getAllCoffresUseCase.execute(),
        this.getAllRestauxUseCase.execute(),
      ]);

      const sortByNewest = (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      // 🔽 Filter only employee users
      const employeeUsers = users.filter((user) => user.role === "employee");

      // 🔽 Get latest 5 employee users
      const latestUsers = employeeUsers.sort(sortByNewest).slice(0, 5);

      const latestAbsences = absences
        .sort(sortByNewest)
        .slice(0, 5)
        .map((absence) => ({
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
        }));

      const latestCoffres = coffres
        .sort(sortByNewest)
        .slice(0, 5)
        .map((coffre) => ({
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

      const latestRestaus = restaus
        .sort(sortByNewest)
        .slice(0, 5)
        .map((restau) => ({
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

      return {
        statusCode: HttpStatus.OK,
        message: "Dashboard data retrieved successfully",
        data: {
          totals: {
            users: employeeUsers.length, // ✅ Only count employees
            absences: absences.length,
            coffres: coffres.length,
            restaus: restaus.length,
          },
          latest: {
            users: latestUsers, // ✅ Only show latest employees
            absences: latestAbsences,
            coffres: latestCoffres,
            restaus: latestRestaus,
          },
        },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(":userId")
  @ApiOperation({
    summary:
      "Get latest 5 records + totals for a specific user (users, absences, coffres, restaus)",
  })
  @ApiResponse({
    status: 200,
    description: "User-specific dashboard data retrieved successfully",
  })
  async getDashboardByUser(@Param("userId") userId: string) {
    try {
      const [users, absences, coffres, restaus] = await Promise.all([
        this.getAllUsersUseCase.execute(),
        this.getAllAbsencesUseCase.execute(),
        this.getAllCoffresUseCase.execute(),
        this.getAllRestauxUseCase.execute(),
      ]);

      const sortByNewest = (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      // Filter by userId
      const userAbsences = absences.filter((item) => item.idUser === userId);
      const userCoffres = coffres.filter((item) => item.idUser === userId);
      const userRestaus = restaus.filter((item) => item.idUser === userId);

      const latestAbsences = userAbsences
        .sort(sortByNewest)
        .slice(0, 5)
        .map((absence) => ({
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
        }));

      const latestCoffres = userCoffres
        .sort(sortByNewest)
        .slice(0, 5)
        .map((coffre) => ({
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

      const latestRestaus = userRestaus
        .sort(sortByNewest)
        .slice(0, 5)
        .map((restau) => ({
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

      return {
        statusCode: HttpStatus.OK,
        message: "User-specific dashboard data retrieved successfully",
        data: {
          totals: {
            absences: userAbsences.length,
            coffres: userCoffres.length,
            restaus: userRestaus.length,
          },
          latest: {
            absences: latestAbsences,
            coffres: latestCoffres,
            restaus: latestRestaus,
          },
        },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
