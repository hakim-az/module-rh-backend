import { Controller, Post, Body, HttpStatus, UseGuards } from "@nestjs/common";
import { YousignService } from "../../application/use-cases/yousign/signature.use-case";
import { UpdateUserUseCase } from "../../application/use-cases/user/update-user.use-case";
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

@ApiTags("Signature")
@ApiBearerAuth()
@Controller("signature")
@UseGuards(KeycloakAuthGuard)
export class YousignController {
  constructor(
    private readonly yousignService: YousignService,
    private readonly updateUserUseCase: UpdateUserUseCase
  ) {}

  // SIGN CONTRACT BY EMPLOYEE -------------------------------------------------
  @Post()
  @ApiOperation({ summary: "Create and activate a signature request" })
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
        idUser: { type: "string", example: "cmcqkvo0000015x2ahuewe6bx" },
        firstName: { type: "string", example: "John" },
        lastName: { type: "string", example: "Doe" },
        email: { type: "string", format: "email", example: "john@example.com" },
        pdfUrl: {
          type: "string",
          format: "uri",
          example: "https://example.com/contract.pdf",
        },
      },
      required: ["idUser", "firstName", "lastName", "email", "pdfUrl"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Signature request successfully created and activated",
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

    const filePath = await this.yousignService.downloadFile(pdfUrl);
    const signatureRequest = await this.yousignService.createSignatureRequest();
    const document = await this.yousignService.uploadDocument(
      signatureRequest.id,
      filePath
    );
    await this.yousignService.addSigner(
      signatureRequest.id,
      document.id,
      firstName,
      lastName,
      email,
      filePath
    );
    await this.yousignService.activateSignatureRequest(signatureRequest.id);

    // Update user status to 'email-sent' after successful signature request
    await this.updateUserUseCase.execute(idUser, {
      statut: "email-sent",
    });
    fs.unlink(filePath, () => {});

    return {
      status: HttpStatus.CREATED, // 👈 add this line
      message: "Signature request created and activated",
      signatureRequestId: signatureRequest.id,
      documentId: document.id,
      signerEmail: email,
      userStatus: "email-sent",
    };
  }
}
