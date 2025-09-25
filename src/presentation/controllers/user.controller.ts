import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpException,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Req,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { GetUserUseCase } from "../../application/use-cases/user/get-user.use-case";
import { GetAllUsersUseCase } from "../../application/use-cases/user/get-all-users.use-case";
import { UpdateUserUseCase } from "../../application/use-cases/user/update-user.use-case";
import { DeleteUserUseCase } from "../../application/use-cases/user/delete-user.use-case";
import { UploadFileUseCase } from "../../application/use-cases/file/upload-file.use-case";
import { UpdateUserDto } from "../../application/dtos/user.dto";
import { KeycloakAuthGuard } from "@/application/auth/keycloak-auth.guard";
import { GroupsGuard } from "@/application/auth/groups.guard";
import { Groups } from "@/application/auth/groups.decorator";
import { NotificationService } from "@/domain/services/notification.service";
import { SendgridService } from "@/domain/services/sendgrid.service";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
@UseGuards(KeycloakAuthGuard)
export class UserController {
  getFileUrlUseCase: any;
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly notificationService: NotificationService,
    private readonly sendgridService: SendgridService
  ) {}

  // GET ALL USERS ----------------------------------------------------------------------
  @Get()
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({ summary: "Récupérer tous les utilisateurs" })
  @ApiResponse({ status: 200, description: "Liste des utilisateurs" })
  async getAllUsers() {
    const users = await this.getAllUsersUseCase.execute();

    // Filter users by role 'employee'
    const employeeUsers = users.filter((user) => user.role === "employee");

    const reversedUsers = employeeUsers.slice().reverse(); // clone and reverse the array

    return {
      statusCode: HttpStatus.OK,
      message: "Employés récupérés avec succès",
      data: reversedUsers,
    };
  }

  // GET ALL USERS EXCEPT ADMINS ----------------------------------------------------------------------
  @Get("admin")
  @UseGuards(GroupsGuard)
  @Groups("RH-Admin")
  @ApiOperation({
    summary: "Admin: Récupérer tous les utilisateurs sauf les admins",
  })
  @ApiResponse({
    status: 200,
    description: "Liste complète des utilisateurs sans les admins",
  })
  async getAllUsersForAdmin() {
    const users = await this.getAllUsersUseCase.execute();

    const nonAdminUsers = users.filter((user) => user.role !== "admin");

    return {
      statusCode: HttpStatus.OK,
      message: "Tous les utilisateurs (hors admins) récupérés avec succès",
      data: nonAdminUsers,
    };
  }

  // GET USERS TOTLA BY STATUS ----------------------------------------------------------------------
  @Get("totals-by-status")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Gestionnaire", "RH-Assistant", "RH-Admin")
  @ApiOperation({ summary: "Get user totals grouped by status" })
  @ApiResponse({
    status: 200,
    description: "User status totals retrieved successfully",
    schema: {
      example: {
        "user-registred": 5,
        "profile-completed": 3,
        "contract-uploaded": 4,
        "email-sent": 2,
        "contract-signed": 6,
        "user-approuved": 1,
      },
    },
  })
  async getUserTotalsByStatus(): Promise<Record<string, number>> {
    try {
      const users = await this.getAllUsersUseCase.execute();

      // 🔽 Filter only employee users
      const employeeUsers = users.filter((user) => user.role === "employee");

      const statusTotals: Record<string, number> = {
        "user-registred": 0,
        "profile-completed": 0,
        "contract-uploaded": 0,
        "email-sent": 0,
        "contract-signed": 0,
        "user-approuved": 0,
      };

      for (const user of employeeUsers) {
        const status = user.statut;
        if (status && statusTotals.hasOwnProperty(status)) {
          statusTotals[status]++;
        }
      }

      return statusTotals;
    } catch (error) {
      throw new HttpException(
        "Failed to retrieve user status totals",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // GET ALL USERS LIGHT ----------------------------------------------------------------------
  @Get("light")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Gestionnaire", "RH-Admin")
  @ApiOperation({
    summary:
      "Récupérer les utilisateurs avec id, prenom et nomComplet uniquement",
  })
  @ApiResponse({ status: 200, description: "Liste des utilisateurs allégée" })
  async getLightUsers() {
    const users = await this.getAllUsersUseCase.execute();

    // 🔽 Filter only employee users
    const employeeUsers = users.filter((user: any) => user.role === "employee");

    const lightUsers = employeeUsers.map((user: any) => ({
      id: user.id,
      prenom: user.prenom,
      nomComplet: user.nomDeNaissance,
    }));

    return {
      statusCode: HttpStatus.OK,
      message: "Utilisateurs (allégés) récupérés avec succès",
      data: lightUsers,
    };
  }

  // GET USER BY ID ----------------------------------------------------------------------
  @Get(":id")
  @UseGuards(GroupsGuard)
  @Groups(
    "Users",
    // salariés
    "Comptabilité",
    "Formation",
    "Gestion",
    "IT",
    "Marketing-Communication",
    "Ressources-Humaines",
    //------------
    "RH-Manager",
    "RH-Admin",
    "RH-Assistant",
    "RH-Gestionnaire",
    "Prospection-Admin",
    "Prospection-Commercial",
    "Prospection-Directeur",
    "Prospection-Gestionnaire",
    "Prospection-Manager",
    "Vente-Admin",
    "Vente-Commercial",
    "Vente-Manager"
  )
  @ApiOperation({ summary: "Récupérer un utilisateur par ID" })
  @ApiResponse({ status: 200, description: "Utilisateur trouvé" })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  async getUserById(@Param("id") id: string) {
    const user = await this.getUserUseCase.execute(id);

    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Utilisateur non trouvé",
        },
        HttpStatus.NOT_FOUND
      );
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Utilisateur trouvé",
      data: user,
    };
  }

  // UPDATE USER BY ID ----------------------------------------------------------------------
  @Patch(":id")
  @UseGuards(GroupsGuard)
  @Groups(
    // salariés
    "Comptabilité",
    "Formation",
    "Gestion",
    "IT",
    "Marketing-Communication",
    "Ressources-Humaines",
    //------------
    "Users",
    "RH-Manager",
    "RH-Admin",
    "RH-Assistant",
    "RH-Gestionnaire",
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
  @ApiOperation({ summary: "Mettre à jour un utilisateur" })
  @ApiResponse({ status: 200, description: "Utilisateur mis à jour" })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  async updateUser(
    @Param("id") id: string,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Body() updateUserDto: UpdateUserDto
  ) {
    try {
      console.log(
        "Files received:",
        files?.map((f) => ({
          fieldname: f.fieldname,
          originalname: f.originalname,
        }))
      );
      console.log(
        "Update DTO before processing:",
        JSON.stringify(updateUserDto, null, 2)
      );

      // Handle file uploads
      if (files && Array.isArray(files)) {
        const fileMap = Object.fromEntries(files.map((f) => [f.fieldname, f]));
        console.log("File map keys:", Object.keys(fileMap));

        // Upload justificatif files if provided
        if (
          updateUserDto.justificatif ||
          Object.keys(fileMap).some(
            (key) =>
              key.includes("fichierCarteVitalePdf") ||
              key.includes("fichierRibPdf") ||
              key.includes("fichierPieceIdentitePdf") ||
              key.includes("fichierPieceIdentitePdfVerso") ||
              key.includes("fichierJustificatifDomicilePdf") ||
              key.includes("fichierAmeli") ||
              key.includes("autreFichier")
          )
        ) {
          // Initialize justificatif object if it doesn't exist
          if (!updateUserDto.justificatif) {
            updateUserDto.justificatif = {} as any;
          }

          if (
            fileMap["justificatif[fichierCarteVitalePdf]"] ||
            fileMap["fichierCarteVitalePdf"]
          ) {
            const file =
              fileMap["justificatif[fichierCarteVitalePdf]"] ||
              fileMap["fichierCarteVitalePdf"];
            console.log("Uploading fichierCarteVitalePdf...");
            updateUserDto.justificatif.fichierCarteVitalePdf =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierCarteVitalePdf:",
              updateUserDto.justificatif.fichierCarteVitalePdf
            );
          }

          if (
            fileMap["justificatif[fichierRibPdf]"] ||
            fileMap["fichierRibPdf"]
          ) {
            const file =
              fileMap["justificatif[fichierRibPdf]"] ||
              fileMap["fichierRibPdf"];
            console.log("Uploading fichierRibPdf...");
            updateUserDto.justificatif.fichierRibPdf =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierRibPdf:",
              updateUserDto.justificatif.fichierRibPdf
            );
          }

          if (
            fileMap["justificatif[fichierPieceIdentitePdf]"] ||
            fileMap["fichierPieceIdentitePdf"]
          ) {
            const file =
              fileMap["justificatif[fichierPieceIdentitePdf]"] ||
              fileMap["fichierPieceIdentitePdf"];
            console.log("Uploading fichierPieceIdentitePdf...");
            updateUserDto.justificatif.fichierPieceIdentitePdf =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierPieceIdentitePdf:",
              updateUserDto.justificatif.fichierPieceIdentitePdf
            );
          }

          if (
            fileMap["justificatif[fichierPieceIdentitePdfVerso]"] ||
            fileMap["fichierPieceIdentitePdfVerso"]
          ) {
            const file =
              fileMap["justificatif[fichierPieceIdentitePdfVerso]"] ||
              fileMap["fichierPieceIdentitePdfVerso"];
            console.log("Uploading fichierPieceIdentitePdfVerso...");
            updateUserDto.justificatif.fichierPieceIdentitePdfVerso =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierPieceIdentitePdfVerso:",
              updateUserDto.justificatif.fichierPieceIdentitePdfVerso
            );
          }

          if (
            fileMap["justificatif[fichierJustificatifDomicilePdf]"] ||
            fileMap["fichierJustificatifDomicilePdf"]
          ) {
            const file =
              fileMap["justificatif[fichierJustificatifDomicilePdf]"] ||
              fileMap["fichierJustificatifDomicilePdf"];
            console.log("Uploading fichierJustificatifDomicilePdf...");
            updateUserDto.justificatif.fichierJustificatifDomicilePdf =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierJustificatifDomicilePdf:",
              updateUserDto.justificatif.fichierJustificatifDomicilePdf
            );
          }

          if (
            fileMap["justificatif[fichierAmeli]"] ||
            fileMap["fichierAmeli"]
          ) {
            const file =
              fileMap["justificatif[fichierAmeli]"] || fileMap["fichierAmeli"];
            console.log("Uploading fichierAmeli...");
            updateUserDto.justificatif.fichierAmeli =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierAmeli:",
              updateUserDto.justificatif.fichierAmeli
            );
          }
        }

        if (fileMap["justificatif[autreFichier]"] || fileMap["autreFichier"]) {
          const file =
            fileMap["justificatif[autreFichier]"] || fileMap["autreFichier"];
          console.log("Uploading autreFichier...");
          updateUserDto.justificatif.autreFichier =
            await this.uploadFileUseCase.execute(
              file.buffer,
              file.originalname,
              file.mimetype
            );
          console.log(
            "Uploaded autreFichier:",
            updateUserDto.justificatif.autreFichier
          );
        }

        // Upload contrat files if provided
        if (
          updateUserDto.contrat ||
          Object.keys(fileMap).some(
            (key) =>
              key.includes("fichierContratNonSignerPdf") ||
              key.includes("fichierContratSignerPdf")
          )
        ) {
          // Initialize contrat object if it doesn't exist
          if (!updateUserDto.contrat) {
            updateUserDto.contrat = {} as any;
          }

          if (
            fileMap["contrat[fichierContratNonSignerPdf]"] ||
            fileMap["fichierContratNonSignerPdf"]
          ) {
            const file =
              fileMap["contrat[fichierContratNonSignerPdf]"] ||
              fileMap["fichierContratNonSignerPdf"];
            console.log("Uploading fichierContratNonSignerPdf...");
            updateUserDto.contrat.fichierContratNonSignerPdf =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierContratNonSignerPdf:",
              updateUserDto.contrat.fichierContratNonSignerPdf
            );
          }

          if (
            fileMap["contrat[fichierContratSignerPdf]"] ||
            fileMap["fichierContratSignerPdf"]
          ) {
            const file =
              fileMap["contrat[fichierContratSignerPdf]"] ||
              fileMap["fichierContratSignerPdf"];
            console.log("Uploading fichierContratSignerPdf...");
            updateUserDto.contrat.fichierContratSignerPdf =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierContratSignerPdf:",
              updateUserDto.contrat.fichierContratSignerPdf
            );
          }
        }

        // Handle avatar upload
        if (fileMap["avatar"]) {
          console.log("Uploading avatar...");
          updateUserDto.avatar = await this.uploadFileUseCase.execute(
            fileMap["avatar"].buffer,
            fileMap["avatar"].originalname,
            fileMap["avatar"].mimetype
          );
          console.log("Uploaded avatar:", updateUserDto.avatar);
        }
      }

      console.log(
        "Update DTO after file processing:",
        JSON.stringify(updateUserDto, null, 2)
      );

      const user = await this.updateUserUseCase.execute(id, updateUserDto);

      // 🔔 Si le statut est "profile-completed", notifier les RH
      if (user?.statut === "profile-completed") {
        // Récupérer tous les utilisateurs
        const allUsers = await this.getAllUsersUseCase.execute();

        // Filtrer uniquement ceux qui ont un rôle RH
        const rhUsers = allUsers.filter((u) =>
          ["admin", "hr", "assistant", "gestionnaire"].includes(u.role)
        );

        // Envoyer la notification à tous les RH
        for (const rhUser of rhUsers) {
          const description = `Un nouveau salarié a complété son profil : ${user?.nomDeNaissance ?? ""} ${user?.prenom ?? ""} (${user?.emailPersonnel ?? "email non renseigné"}).`;

          await this.notificationService.createCustomNotification(
            rhUser.id,
            "Profil salarié complété",
            description.trim()
          );

          // Envoi email aux RH
          await this.sendgridService.sendEmail({
            to: rhUser.emailProfessionnel,
            from: process.env.SENDGRID_FROM_EMAIL,
            templateId: "d-4869231de03e4c36804e69ad423c7ba2",
            dynamicTemplateData: {
              prenom: user?.prenom,
              nom: user?.nomDeNaissance,
              email: user?.emailPersonnel,
              actionUrl: `${process.env.APP_URL}/accueil/salarié/details/${user.id}`,
              currentYear: new Date().getFullYear(),
            },
          });
        }
      }

      // 🔔 Si le statut est "user-approuved", notifier le salarié
      if (user?.statut === "user-approuved") {
        const description = `Votre profil a été validé par le service RH. Vous avez maintenant accès à votre espace personnel.`;

        await this.notificationService.createCustomNotification(
          user.id,
          "Profil approuvé",
          description.trim()
        );

        // Envoi email au salarié
        await this.sendgridService.sendEmail({
          to: user.emailProfessionnel,
          from: process.env.SENDGRID_FROM_EMAIL,
          templateId: "d-647da8e09caa43eca7cc970012c32938",
          dynamicTemplateData: {
            prenom: user?.prenom,
            nom: user?.nomDeNaissance,
            actionUrl: `${process.env.APP_URL}/accueil`,
            currentYear: new Date().getFullYear(),
          },
        });
      }

      return {
        statusCode: HttpStatus.OK,
        message: "Utilisateur mis à jour avec succès",
        data: user,
      };
    } catch (error) {
      console.error("Error updating user:", error);
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  // ADD USER AVATAR ----------------------------------------------------------------------
  @Put(":id/avatar")
  @UseGuards(GroupsGuard)
  @Groups(
    // salariés
    "Comptabilité",
    "Formation",
    "Gestion",
    "IT",
    "Marketing-Communication",
    "Ressources-Humaines",
    //------------
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
    FileInterceptor("avatar", {
      limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
      fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(
            new HttpException(
              "Only JPG, JPEG, or PNG images allowed",
              HttpStatus.BAD_REQUEST
            ),
            false
          );
        }
        cb(null, true);
      },
    })
  )
  @ApiOperation({ summary: "Uploader une image d'avatar pour un utilisateur" })
  @ApiResponse({ status: 200, description: "Avatar mis à jour avec succès" })
  @ApiResponse({ status: 400, description: "Fichier invalide" })
  async uploadAvatar(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new HttpException("No file uploaded", HttpStatus.BAD_REQUEST);
    }

    try {
      // Upload image to S3
      const avatarUrl = await this.uploadFileUseCase.execute(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      // Update only the avatar field
      const updatedUser = await this.updateUserUseCase.execute(id, {
        avatar: avatarUrl,
      });

      return {
        statusCode: HttpStatus.OK,
        message: "Avatar mis à jour avec succès",
        data: updatedUser,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // DELETE USER BY ID ----------------------------------------------------------------------
  @Delete(":id")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Gestionnaire", "RH-Admin")
  @ApiOperation({ summary: "Supprimer un utilisateur" })
  @ApiResponse({ status: 200, description: "Utilisateur supprimé" })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  async deleteUser(@Param("id") id: string) {
    try {
      const success = await this.deleteUserUseCase.execute(id);
      return {
        statusCode: HttpStatus.OK,
        message: "Utilisateur supprimé avec succès",
        data: { deleted: success },
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        },
        HttpStatus.NOT_FOUND
      );
    }
  }
}
