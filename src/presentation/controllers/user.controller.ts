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
} from "@nestjs/common";
import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateUserUseCase } from "../../application/use-cases/user/create-user.use-case";
import { GetUserUseCase } from "../../application/use-cases/user/get-user.use-case";
import { GetAllUsersUseCase } from "../../application/use-cases/user/get-all-users.use-case";
import { UpdateUserUseCase } from "../../application/use-cases/user/update-user.use-case";
import { DeleteUserUseCase } from "../../application/use-cases/user/delete-user.use-case";
import { UploadFileUseCase } from "../../application/use-cases/file/upload-file.use-case";
import { CreateUserDto, UpdateUserDto } from "../../application/dtos/user.dto";

@ApiTags("users")
@Controller("users")
export class UserController {
  getFileUrlUseCase: any;
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase
  ) {}

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        // Allow PDF files for justificatif documents and images for avatar
        const allowedTypes = [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/jpg",
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(
            new HttpException(
              "Only PDF files and images are allowed",
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
    summary:
      "Créer un utilisateur avec toutes ses données associées (contrat optionnel)",
  })
  @ApiResponse({
    status: 201,
    description: "Utilisateur créé avec succès avec toutes ses données",
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  async createUser(
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Body() createUserDto: CreateUserDto
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
        "CreateUserDto before processing:",
        JSON.stringify(createUserDto, null, 2)
      );

      // Handle file uploads
      if (files && Array.isArray(files)) {
        const fileMap = Object.fromEntries(files.map((f) => [f.fieldname, f]));
        console.log("File map keys:", Object.keys(fileMap));

        // Upload justificatif files if provided
        if (
          createUserDto.justificatif ||
          Object.keys(fileMap).some(
            (key) =>
              key.includes("fichierCarteVitalePdf") ||
              key.includes("fichierRibPdf") ||
              key.includes("fichierPieceIdentitePdf") ||
              key.includes("fichierJustificatifDomicilePdf") ||
              key.includes("fichierAmeli")
          )
        ) {
          // Initialize justificatif object if it doesn't exist
          if (!createUserDto.justificatif) {
            createUserDto.justificatif = {} as any;
          }

          if (
            fileMap["justificatif[fichierCarteVitalePdf]"] ||
            fileMap["fichierCarteVitalePdf"]
          ) {
            const file =
              fileMap["justificatif[fichierCarteVitalePdf]"] ||
              fileMap["fichierCarteVitalePdf"];
            console.log("Uploading fichierCarteVitalePdf...");
            createUserDto.justificatif.fichierCarteVitalePdf =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierCarteVitalePdf:",
              createUserDto.justificatif.fichierCarteVitalePdf
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
            createUserDto.justificatif.fichierRibPdf =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierRibPdf:",
              createUserDto.justificatif.fichierRibPdf
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
            createUserDto.justificatif.fichierPieceIdentitePdf =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierPieceIdentitePdf:",
              createUserDto.justificatif.fichierPieceIdentitePdf
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
            createUserDto.justificatif.fichierJustificatifDomicilePdf =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierJustificatifDomicilePdf:",
              createUserDto.justificatif.fichierJustificatifDomicilePdf
            );
          }

          if (
            fileMap["justificatif[fichierAmeli]"] ||
            fileMap["fichierAmeli"]
          ) {
            const file =
              fileMap["justificatif[fichierAmeli]"] || fileMap["fichierAmeli"];
            console.log("Uploading fichierAmeli...");
            createUserDto.justificatif.fichierAmeli =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierAmeli:",
              createUserDto.justificatif.fichierAmeli
            );
          }
        }

        // Upload contrat files if provided
        if (
          createUserDto.contrat ||
          Object.keys(fileMap).some(
            (key) =>
              key.includes("fichierContratNonSignerPdf") ||
              key.includes("fichierContratSignerPdf")
          )
        ) {
          // Initialize contrat object if it doesn't exist
          if (!createUserDto.contrat) {
            createUserDto.contrat = {} as any;
          }

          if (
            fileMap["contrat[fichierContratNonSignerPdf]"] ||
            fileMap["fichierContratNonSignerPdf"]
          ) {
            const file =
              fileMap["contrat[fichierContratNonSignerPdf]"] ||
              fileMap["fichierContratNonSignerPdf"];
            console.log("Uploading fichierContratNonSignerPdf...");
            createUserDto.contrat.fichierContratNonSignerPdf =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierContratNonSignerPdf:",
              createUserDto.contrat.fichierContratNonSignerPdf
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
            createUserDto.contrat.fichierContratSignerPdf =
              await this.uploadFileUseCase.execute(
                file.buffer,
                file.originalname,
                file.mimetype
              );
            console.log(
              "Uploaded fichierContratSignerPdf:",
              createUserDto.contrat.fichierContratSignerPdf
            );
          }
        }

        // Handle avatar upload
        if (fileMap["avatar"]) {
          console.log("Uploading avatar...");
          createUserDto.avatar = await this.uploadFileUseCase.execute(
            fileMap["avatar"].buffer,
            fileMap["avatar"].originalname,
            fileMap["avatar"].mimetype
          );
          console.log("Uploaded avatar:", createUserDto.avatar);
        }
      }

      console.log(
        "CreateUserDto after file processing:",
        JSON.stringify(createUserDto, null, 2)
      );

      const user = await this.createUserUseCase.execute(createUserDto);
      return {
        statusCode: HttpStatus.CREATED,
        message:
          "Utilisateur créé avec succès avec toutes ses données associées",
        data: user,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
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

  @Get("totals-by-status")
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

  @Get("light")
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

  @Get(":id")
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
              key.includes("fichierJustificatifDomicilePdf") ||
              key.includes("fichierAmeli")
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

  @Put(":id/avatar")
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

  @Delete(":id")
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
