import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  UseInterceptors,
  UploadedFiles,
} from "@nestjs/common";
import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateUserUseCase } from "../../application/use-cases/user/create-user.use-case";
import { UploadFileUseCase } from "../../application/use-cases/file/upload-file.use-case";
import { CreateUserDto } from "../../application/dtos/user.dto";

@ApiTags("signup")
@Controller("signup")
export class SignupController {
  getFileUrlUseCase: any;
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase
  ) {}

  // ADD USER ----------------------------------------------------------------------
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
}
