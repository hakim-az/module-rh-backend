import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UseGuards,
  Param,
  BadRequestException,
} from "@nestjs/common";
import { UpdateUserUseCase } from "@/application/use-cases/user/update-user.use-case";
import { UploadFileUseCase } from "@/application/use-cases/file/upload-file.use-case";
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { KeycloakAuthGuard } from "@/application/auth/keycloak-auth.guard";
import { GroupsGuard } from "@/application/auth/groups.guard";
import { Groups } from "@/application/auth/groups.decorator";
import { YousignIframeService } from "@/application/use-cases/yousign/yousign-iframe.service";
import { UpdateContratUseCase } from "@/application/use-cases/contrat/update-contrat.use-case";

interface SignatureField {
  page: number;
  x: number;
  y: number;
}

interface SignatureConfig {
  // Ancien format (compatibilité)
  employeePage?: number;
  employeeX?: number;
  employeeY?: number;
  directorPage?: number;
  directorX?: number;
  directorY?: number;

  // Nouveau format (multi-champs)
  employeeFields?: SignatureField[];
  directorFields?: SignatureField[];
}

const SIGNATURE_CONFIGS: Record<string, SignatureConfig> = {
  wc: {
    employeePage: 5,
    employeeX: 40,
    employeeY: 500,
    directorPage: 5,
    directorX: 400,
    directorY: 500,
  },
  "fr-teleconseiller": {
    employeePage: 6,
    employeeX: 400,
    employeeY: 200,
    directorPage: 6,
    directorX: 40,
    directorY: 200,
  },
  fr: {
    employeePage: 5,
    employeeX: 40,
    employeeY: 300,
    directorPage: 5,
    directorX: 400,
    directorY: 300,
  },
  ap: {
    employeePage: 5,
    employeeX: 40,
    employeeY: 350,
    directorPage: 5,
    directorX: 400,
    directorY: 350,
  },
  mt: {
    employeePage: 5,
    employeeX: 40,
    employeeY: 300,
    directorPage: 5,
    directorX: 400,
    directorY: 300,
  },
  commercial: {
    employeeFields: [
      { page: 11, x: 400, y: 320 },
      { page: 14, x: 400, y: 750 },
      { page: 26, x: 400, y: 250 },
      { page: 28, x: 400, y: 700 },
    ],
    directorFields: [
      { page: 11, x: 40, y: 320 },
      { page: 14, x: 40, y: 750 },
      { page: 26, x: 40, y: 250 },
      { page: 28, x: 40, y: 700 },
    ],
  },
};

@ApiTags("Signature-cdi-iframe")
@ApiBearerAuth()
@Controller("signature-cdi-iframe")
@UseGuards(KeycloakAuthGuard)
export class YousignIframeController {
  constructor(
    private readonly yousignService: YousignIframeService,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateContratUseCase: UpdateContratUseCase,
    private readonly uploadFileUseCase: UploadFileUseCase
  ) {}

  @Post(":contractType/salarie")
  @ApiOperation({
    summary: "Initiate employee signature process",
  })
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
  @ApiParam({
    name: "contractType",
    enum: ["wc", "fr-teleconseiller", "fr", "ap", "mt", "commercial"],
    description: "Type of contract",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        idUser: { type: "string" },
        idContrat: { type: "string" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
        pdfUrl: { type: "string" },
      },
      required: [
        "idUser",
        "idContrat",
        "firstName",
        "lastName",
        "email",
        "pdfUrl",
      ],
    },
  })
  async employeeSignature(
    @Param("contractType") contractType: string,
    @Body() body: any
  ) {
    const config = SIGNATURE_CONFIGS[contractType];
    if (!config) {
      throw new BadRequestException(`Invalid contract type: ${contractType}`);
    }

    const { idUser, idContrat, firstName, lastName, email, pdfUrl } = body;

    // 1. Download PDF
    const fileBuffer = await this.yousignService.downloadFileBuffer(pdfUrl);
    const fileName = `contrat_${idContrat}_init_${Date.now()}.pdf`;

    // 2. Create signature request
    const signatureRequest = await this.yousignService.createSignatureRequest();

    // 3. Upload document
    const document = await this.yousignService.uploadDocument(
      signatureRequest.id,
      fileBuffer,
      fileName
    );

    // 4. Prepare employee fields
    const employeeFields = config.employeeFields
      ? config.employeeFields
      : [
          {
            page: config.employeePage,
            x: config.employeeX,
            y: config.employeeY,
          },
        ];

    // 5. Add signer
    const signerResponse = await this.yousignService.addSigners(
      signatureRequest.id,
      document.id,
      [{ firstName, lastName, email, fields: employeeFields }]
    );

    const signerId = signerResponse?.[0]?.id;
    if (!signerId) {
      throw new BadRequestException("Unable to retrieve signer ID");
    }

    // 6. Activate
    await this.yousignService.activateSignatureRequest(signatureRequest.id);

    // 7. Wait for activation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 8. Get signature URL
    const signatureUrl = await this.yousignService.getSignerUrl(
      signatureRequest.id,
      signerId
    );

    return {
      status: HttpStatus.CREATED,
      message: "Employee signature initiated",
      signatureRequestId: signatureRequest.id,
      documentId: document.id,
      signerEmail: email,
      contractType,
      signatureUrl,
    };
  }

  @Post(":contractType/rh")
  @ApiOperation({
    summary: "Initiate employee signature process",
  })
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiParam({
    name: "contractType",
    enum: ["wc", "fr-teleconseiller", "fr", "ap", "mt", "commercial"],
    description: "Type of contract",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        idUser: { type: "string" },
        idContrat: { type: "string" },
        pdfUrl: { type: "string" },
      },
      required: [
        "idUser",
        "idContrat",
        "firstName",
        "lastName",
        "email",
        "pdfUrl",
      ],
    },
  })
  async hrSignature(
    @Param("contractType") contractType: string,
    @Body() body: any
  ) {
    const config = SIGNATURE_CONFIGS[contractType];
    if (!config) {
      throw new BadRequestException(`Invalid contract type: ${contractType}`);
    }

    const { idUser, idContrat, pdfUrl } = body;

    // 1. Download PDF
    const fileBuffer = await this.yousignService.downloadFileBuffer(pdfUrl);
    const fileName = `contrat_${idContrat}_init_${Date.now()}.pdf`;

    // 2. Create signature request
    const signatureRequest = await this.yousignService.createSignatureRequest();

    // 3. Upload document
    const document = await this.yousignService.uploadDocument(
      signatureRequest.id,
      fileBuffer,
      fileName
    );

    // 4. Prepare employee fields
    const directorFields = config.directorFields
      ? config.directorFields
      : [
          {
            page: config.directorPage,
            x: config.directorX,
            y: config.directorY,
          },
        ];

    // 5. Add signer
    const signerResponse = await this.yousignService.addSigners(
      signatureRequest.id,
      document.id,
      [
        {
          firstName: "Coline",
          lastName: "DE LOS SANTOS",
          email: "rh@finanssor.fr",
          fields: directorFields,
        },
      ]
    );

    const signerId = signerResponse?.[0]?.id;
    if (!signerId) {
      throw new BadRequestException("Unable to retrieve signer ID");
    }

    // 6. Activate
    await this.yousignService.activateSignatureRequest(signatureRequest.id);

    // 7. Wait for activation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 8. Get signature URL
    const signatureUrl = await this.yousignService.getSignerUrl(
      signatureRequest.id,
      signerId
    );

    return {
      status: HttpStatus.CREATED,
      message: "Employee signature initiated",
      signatureRequestId: signatureRequest.id,
      documentId: document.id,
      contractType,
      signatureUrl,
    };
  }

  @Post(":contractType/complete-salarie")
  @ApiOperation({
    summary: "Complete signature and save signed document",
  })
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
  @ApiParam({
    name: "contractType",
    enum: ["wc", "fr-teleconseiller", "fr", "ap", "mt", "commercial"],
    description: "Type of contract",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        idUser: { type: "string" },
        idContrat: { type: "string" },
        signatureRequestId: { type: "string" },
        documentId: { type: "string" },
      },
      required: ["idUser", "idContrat", "signatureRequestId", "documentId"],
    },
  })
  async completeSignature(
    @Param("contractType") contractType: string,
    @Body() body: any
  ) {
    const config = SIGNATURE_CONFIGS[contractType];
    if (!config) {
      throw new BadRequestException(`Invalid contract type: ${contractType}`);
    }

    const { idUser, idContrat, signatureRequestId, documentId } = body;

    // 1. Check signature status
    const status =
      await this.yousignService.getSignatureRequestStatus(signatureRequestId);

    if (status.status !== "done") {
      throw new BadRequestException(
        `Signature not completed yet. Current status: ${status.status}`
      );
    }

    // 2. Download the SIGNED PDF
    const signedPdfBuffer = await this.yousignService.downloadSignedDocument(
      signatureRequestId,
      documentId
    );

    const signedFileName = `contrat_${idContrat}_signed_${Date.now()}.pdf`;

    // 3. Upload signed file
    const fichierContratSignerPdf = await this.uploadFileUseCase.execute(
      signedPdfBuffer,
      signedFileName,
      "application/pdf"
    );

    // 4. Update user and contract
    await this.updateUserUseCase.execute(idUser, {
      statut: "contract-signed",
    });

    await this.updateContratUseCase.execute(idContrat, {
      fichierContratSignerPdf,
    });

    return {
      status: HttpStatus.OK,
      message: "Signature completed and contract updated",
      signatureRequestId,
      documentId,
      fichierContratSignerPdf,
    };
  }

  @Post(":contractType/complete-rh")
  @ApiOperation({
    summary: "Complete signature and save signed document",
  })
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiParam({
    name: "contractType",
    enum: ["wc", "fr-teleconseiller", "fr", "ap", "mt", "commercial"],
    description: "Type of contract",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        idUser: { type: "string" },
        idContrat: { type: "string" },
        signatureRequestId: { type: "string" },
        documentId: { type: "string" },
      },
      required: ["idUser", "idContrat", "signatureRequestId", "documentId"],
    },
  })
  async hrCompleteSignature(
    @Param("contractType") contractType: string,
    @Body() body: any
  ) {
    const config = SIGNATURE_CONFIGS[contractType];
    if (!config) {
      throw new BadRequestException(`Invalid contract type: ${contractType}`);
    }

    const { idUser, idContrat, signatureRequestId, documentId } = body;

    // 1. Check signature status
    const status =
      await this.yousignService.getSignatureRequestStatus(signatureRequestId);

    if (status.status !== "done") {
      throw new BadRequestException(
        `Signature not completed yet. Current status: ${status.status}`
      );
    }

    // 2. Download the SIGNED PDF
    const signedPdfBuffer = await this.yousignService.downloadSignedDocument(
      signatureRequestId,
      documentId
    );

    const signedFileName = `contrat_${idContrat}_signed_${Date.now()}.pdf`;

    // 3. Upload signed file
    const fichierContratSignerPdf = await this.uploadFileUseCase.execute(
      signedPdfBuffer,
      signedFileName,
      "application/pdf"
    );

    // 4. Update user and contract
    await this.updateUserUseCase.execute(idUser, {
      statut: "user-approuved",
    });

    await this.updateContratUseCase.execute(idContrat, {
      fichierContratSignerPdf,
    });

    return {
      status: HttpStatus.OK,
      message: "Signature completed and contract updated",
      signatureRequestId,
      documentId,
      fichierContratSignerPdf,
    };
  }
}
