import { Controller, Post, Body, HttpStatus } from "@nestjs/common";
import { YousignService } from "../../application/use-cases/yousign/signature.use-case";
import * as fs from "fs";
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";

@ApiTags("Signature")
@Controller("signature")
export class YousignController {
  constructor(private readonly yousignService: YousignService) {}

  @Post()
  @ApiOperation({ summary: "Create and activate a signature request" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        firstName: { type: "string", example: "John" },
        lastName: { type: "string", example: "Doe" },
        email: { type: "string", format: "email", example: "john@example.com" },
        pdfUrl: {
          type: "string",
          format: "uri",
          example: "https://example.com/contract.pdf",
        },
      },
      required: ["firstName", "lastName", "email", "pdfUrl"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Signature request successfully created and activated",
  })
  async createSignature(
    @Body()
    body: {
      firstName: string;
      lastName: string;
      email: string;
      pdfUrl: string;
    }
  ) {
    const { firstName, lastName, email, pdfUrl } = body;

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
      email
    );
    await this.yousignService.activateSignatureRequest(signatureRequest.id);

    fs.unlink(filePath, () => {});

    return {
      status: HttpStatus.CREATED, // 👈 add this line
      message: "Signature request created and activated",
      signatureRequestId: signatureRequest.id,
      documentId: document.id,
      signerEmail: email,
    };
  }
}
