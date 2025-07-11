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
} from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
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
      // Handle file uploads
      if (files && Array.isArray(files)) {
        const fileMap = Object.fromEntries(files.map((f) => [f.fieldname, f]));

        // Upload justificatif files if provided
        if (createUserDto.justificatif) {
          if (fileMap["fichierCarteVitalePdf"]) {
            createUserDto.justificatif.fichierCarteVitalePdf = await this.uploadFileUseCase.execute(
              fileMap["fichierCarteVitalePdf"].buffer,
              fileMap["fichierCarteVitalePdf"].originalname,
              fileMap["fichierCarteVitalePdf"].mimetype
            );
          }

          if (fileMap["fichierRibPdf"]) {
            createUserDto.justificatif.fichierRibPdf = await this.uploadFileUseCase.execute(
              fileMap["fichierRibPdf"].buffer,
              fileMap["fichierRibPdf"].originalname,
              fileMap["fichierRibPdf"].mimetype
            );
          }

          if (fileMap["fichierPieceIdentitePdf"]) {
            createUserDto.justificatif.fichierPieceIdentitePdf = await this.uploadFileUseCase.execute(
              fileMap["fichierPieceIdentitePdf"].buffer,
              fileMap["fichierPieceIdentitePdf"].originalname,
              fileMap["fichierPieceIdentitePdf"].mimetype
            );
          }

          if (fileMap["fichierJustificatifDomicilePdf"]) {
            createUserDto.justificatif.fichierJustificatifDomicilePdf = await this.uploadFileUseCase.execute(
              fileMap["fichierJustificatifDomicilePdf"].buffer,
              fileMap["fichierJustificatifDomicilePdf"].originalname,
              fileMap["fichierJustificatifDomicilePdf"].mimetype
            );
          }
        }

        // Upload contrat files if provided
        if (createUserDto.contrat) {
          if (fileMap["fichierContratNonSignerPdf"]) {
            createUserDto.contrat.fichierContratNonSignerPdf = await this.uploadFileUseCase.execute(
              fileMap["fichierContratNonSignerPdf"].buffer,
              fileMap["fichierContratNonSignerPdf"].originalname,
              fileMap["fichierContratNonSignerPdf"].mimetype
            );
          }

          if (fileMap["fichierContratSignerPdf"]) {
            createUserDto.contrat.fichierContratSignerPdf = await this.uploadFileUseCase.execute(
              fileMap["fichierContratSignerPdf"].buffer,
              fileMap["fichierContratSignerPdf"].originalname,
              fileMap["fichierContratSignerPdf"].mimetype
            );
          }
        }
      }

      const user = await this.createUserUseCase.execute(createUserDto);
      return {
        statusCode: HttpStatus.CREATED,
        message:
          "Utilisateur créé avec succès avec toutes ses données associées",
        data: user,
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

  @Get()
  @ApiOperation({ summary: "Récupérer tous les utilisateurs" })
  @ApiResponse({ status: 200, description: "Liste des utilisateurs" })
  async getAllUsers() {
    const users = await this.getAllUsersUseCase.execute();
    return {
      statusCode: HttpStatus.OK,
      message: "Utilisateurs récupérés avec succès",
      data: users,
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

  @Put(":id")
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
      // Handle file uploads
      if (files && Array.isArray(files)) {
        const fileMap = Object.fromEntries(files.map((f) => [f.fieldname, f]));

        // Upload justificatif files if provided
        if (updateUserDto.justificatif) {
          if (fileMap["fichierCarteVitalePdf"]) {
            updateUserDto.justificatif.fichierCarteVitalePdf = await this.uploadFileUseCase.execute(
              fileMap["fichierCarteVitalePdf"].buffer,
              fileMap["fichierCarteVitalePdf"].originalname,
              fileMap["fichierCarteVitalePdf"].mimetype
            );
          }

          if (fileMap["fichierRibPdf"]) {
            updateUserDto.justificatif.fichierRibPdf = await this.uploadFileUseCase.execute(
              fileMap["fichierRibPdf"].buffer,
              fileMap["fichierRibPdf"].originalname,
              fileMap["fichierRibPdf"].mimetype
            );
          }

          if (fileMap["fichierPieceIdentitePdf"]) {
            updateUserDto.justificatif.fichierPieceIdentitePdf = await this.uploadFileUseCase.execute(
              fileMap["fichierPieceIdentitePdf"].buffer,
              fileMap["fichierPieceIdentitePdf"].originalname,
              fileMap["fichierPieceIdentitePdf"].mimetype
            );
          }

          if (fileMap["fichierJustificatifDomicilePdf"]) {
            updateUserDto.justificatif.fichierJustificatifDomicilePdf = await this.uploadFileUseCase.execute(
              fileMap["fichierJustificatifDomicilePdf"].buffer,
              fileMap["fichierJustificatifDomicilePdf"].originalname,
              fileMap["fichierJustificatifDomicilePdf"].mimetype
            );
          }
        }

        // Upload contrat files if provided
        if (updateUserDto.contrat) {
          if (fileMap["fichierContratNonSignerPdf"]) {
            updateUserDto.contrat.fichierContratNonSignerPdf = await this.uploadFileUseCase.execute(
              fileMap["fichierContratNonSignerPdf"].buffer,
              fileMap["fichierContratNonSignerPdf"].originalname,
              fileMap["fichierContratNonSignerPdf"].mimetype
            );
          }

          if (fileMap["fichierContratSignerPdf"]) {
            updateUserDto.contrat.fichierContratSignerPdf = await this.uploadFileUseCase.execute(
              fileMap["fichierContratSignerPdf"].buffer,
              fileMap["fichierContratSignerPdf"].originalname,
              fileMap["fichierContratSignerPdf"].mimetype
            );
          }
        }
      }

      const user = await this.updateUserUseCase.execute(id, updateUserDto);
      return {
        statusCode: HttpStatus.OK,
        message: "Utilisateur mis à jour avec succès",
        data: user,
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
