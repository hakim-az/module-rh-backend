import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Res,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { Response } from "express";
import { UploadFileUseCase } from "../../application/use-cases/file/upload-file.use-case";
import { DownloadFileUseCase } from "../../application/use-cases/file/download-file.use-case";
import { GetFileUrlUseCase } from "../../application/use-cases/file/get-file-url.use-case";
import { DeleteFileUseCase } from "../../application/use-cases/file/delete-file.use-case";
import { KeycloakAuthGuard } from "@/application/auth/keycloak-auth.guard";
import { GroupsGuard } from "@/application/auth/groups.guard";
import { Groups } from "@/application/auth/groups.decorator";

@ApiTags("files")
@ApiBearerAuth()
@Controller("files")
@UseGuards(KeycloakAuthGuard)
export class FileController {
  constructor(
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly downloadFileUseCase: DownloadFileUseCase,
    private readonly getFileUrlUseCase: GetFileUrlUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase
  ) {}

  // ADDING FILE ---------------------------------------------------
  @Post("upload")
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
  @ApiOperation({ summary: "Upload a file to S3" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ status: 201, description: "File uploaded successfully" })
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
    })
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ fileName: string; message: string }> {
    if (!file) {
      throw new HttpException("No file uploaded", HttpStatus.BAD_REQUEST);
    }

    // Vérifier le type de fichier (PDF uniquement pour les contrats)
    if (file.mimetype !== "application/pdf") {
      throw new HttpException(
        "Only PDF files are allowed",
        HttpStatus.BAD_REQUEST
      );
    }

    // Vérifier la taille du fichier (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new HttpException(
        "File size exceeds 50MB limit",
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const fileName = await this.uploadFileUseCase.execute(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      return {
        fileName,
        message: "File uploaded successfully",
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // DOWNLOAD FILE BY ITS NAME ---------------------------------------------------
  @Get("download/:fileName")
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
  @ApiOperation({ summary: "Download a file from S3" })
  @ApiResponse({ status: 200, description: "File downloaded successfully" })
  async downloadFile(
    @Param("fileName") fileName: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      const fileBuffer = await this.downloadFileUseCase.execute(fileName);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.send(fileBuffer);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // VIEW FILE ---------------------------------------------------
  @Get("view/:fileName")
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
  @ApiOperation({ summary: "View a file from S3 directly in browser" })
  @ApiResponse({ status: 200, description: "File streamed successfully" })
  async viewFile(
    @Param("fileName") fileName: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      const fileBuffer = await this.downloadFileUseCase.execute(fileName);

      // Ici on suppose que c'est un PDF — sinon tu peux récupérer le mimetype stocké dans S3 aussi
      res.setHeader("Content-Type", "application/pdf");
      res.send(fileBuffer);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // GETTING FILE URL ---------------------------------------------------
  @Get("url/:fileName")
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
  @ApiOperation({ summary: "Get a signed URL for a file from S3" })
  @ApiResponse({
    status: 200,
    description: "Signed URL generated successfully",
    schema: {
      type: "object",
      properties: {
        url: { type: "string" },
        fileName: { type: "string" },
        expiresIn: { type: "string" },
      },
    },
  })
  async getFileUrl(
    @Param("fileName") fileName: string
  ): Promise<{ url: string; fileName: string; expiresIn: string }> {
    try {
      const decodedFileName = decodeURIComponent(fileName);

      // ajoute ici le dossier uploads/
      const key = `uploads/${decodedFileName}`;

      const url = await this.getFileUrlUseCase.execute(key);

      return {
        url,
        fileName: decodedFileName,
        expiresIn: "1 hour",
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // DELETE FILE ---------------------------------------------------
  @Delete(":fileName")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Assistant", "RH-Admin")
  @ApiOperation({ summary: "Delete a file from S3" })
  @ApiResponse({
    status: 200,
    description: "File deleted successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
        fileName: { type: "string" },
      },
    },
  })
  async deleteFile(
    @Param("fileName") fileName: string
  ): Promise<{ message: string; fileName: string }> {
    try {
      await this.deleteFileUseCase.execute(fileName);

      return {
        message: "File deleted successfully",
        fileName,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
