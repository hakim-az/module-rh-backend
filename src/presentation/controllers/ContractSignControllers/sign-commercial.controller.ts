import { Controller, Post, Body, HttpStatus, UseGuards } from "@nestjs/common";
import { UpdateUserUseCase } from "@/application/use-cases/user/update-user.use-case";
import * as fs from "fs";
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { KeycloakAuthGuard } from "@/application/auth/keycloak-auth.guard";
import { GroupsGuard } from "@/application/auth/groups.guard";
import { Groups } from "@/application/auth/groups.decorator";
import { YousignServiceCommercial } from "@/application/use-cases/yousign/signature-commercial.use-case";

@ApiTags("Signature-commercial")
@ApiBearerAuth()
@Controller("signature-commercial")
@UseGuards(KeycloakAuthGuard)
export class YousignCommercialController {
  constructor(
    private readonly yousignService: YousignServiceCommercial,
    private readonly updateUserUseCase: UpdateUserUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: "Create and activate a signature request" })
  @UseGuards(GroupsGuard)
  @Groups(
    "Comptabilité",
    "Formation",
    "Gestion",
    "IT",
    "Marketing-Communication",
    "Ressources-Humaines",
    "Users",
    "Prospection-Admin",
    "Prospection-Commercial",
    "Prospection-Directeur",
    "Prospection-Gestionnaire",
    "Prospection-Manager",
    "Vente-Admin",
    "Vente-Commercial",
    "Vente-Manager"
  )
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        idUser: { type: "string" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string", format: "email" },
        pdfUrl: { type: "string", format: "uri" },
      },
      required: ["idUser", "firstName", "lastName", "email", "pdfUrl"],
    },
  })
  async createSignature(
    @Body()
    body: {
      idUser: string;
      firstName: string;
      lastName: string;
      email: string;
      pdfUrl: string;
    }
  ) {
    const { idUser, firstName, lastName, email, pdfUrl } = body;

    // Télécharger le PDF
    const filePath = await this.yousignService.downloadFile(pdfUrl);

    // Créer la signature request
    const signatureRequest = await this.yousignService.createSignatureRequest();

    // Upload du document
    const document = await this.yousignService.uploadDocument(
      signatureRequest.id,
      filePath
    );

    // Définir les pages et les coordonnées X/Y pour chaque signataire
    const employeeFields = [
      { page: 11, x: 400, y: 320 },
      { page: 14, x: 400, y: 750 },
      { page: 26, x: 400, y: 250 },
      { page: 28, x: 400, y: 700 },
    ];

    const directorFields = [
      { page: 11, x: 40, y: 320 },
      { page: 14, x: 40, y: 750 },
      { page: 26, x: 40, y: 250 },
      { page: 28, x: 40, y: 700 },
    ];

    // Ajouter les 2 signataires
    await this.yousignService.addSigners(signatureRequest.id, document.id, [
      {
        firstName,
        lastName,
        email,
        fields: employeeFields,
      },
      {
        firstName: "Coline",
        lastName: "DE LOS SANTOS",
        email: "rh@finanssor.fr",
        fields: directorFields,
      },
    ]);

    // Activer la signature request
    await this.yousignService.activateSignatureRequest(signatureRequest.id);

    // Mettre à jour le statut de l'utilisateur
    await this.updateUserUseCase.execute(idUser, { statut: "email-sent" });

    // Supprimer le fichier temporaire
    fs.unlink(filePath, () => {});

    return {
      status: HttpStatus.CREATED,
      message: "Signature request created and activated",
      signatureRequestId: signatureRequest.id,
      documentId: document.id,
      signerEmail: email,
      directorEmail: "directeur@example.com",
      userStatus: "email-sent",
    };
  }
}
