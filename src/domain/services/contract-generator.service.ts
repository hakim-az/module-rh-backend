// src/modules/contract-generator/contract-generator.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { S3Service } from "./s3.service";
import { GetUserUseCase } from "@/application/use-cases/user/get-user.use-case";

@Injectable()
export class ContractGeneratorService {
  private readonly templateFR = "templates/template-contart-FR.pdf";

  constructor(
    private readonly s3Service: S3Service,
    private readonly getUserUseCase: GetUserUseCase
  ) {}

  async generateFranceTelephoneContract(contart: any): Promise<Buffer> {
    let templateBytes: Buffer;

    // Get user who owns the contract
    const user = await this.getUserUseCase.execute(contart.idUser);

    try {
      // ✅ Fetch the template from AWS S3 instead of local file
      templateBytes = await this.s3Service.downloadFile(this.templateFR);
    } catch {
      throw new NotFoundException(
        `Template PDF non trouvé dans S3 : ${this.templateFR}`
      );
    }

    const pdfDoc = await PDFDocument.load(templateBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const dateNaissanceFormatted = user.naissance.dateDeNaissance
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "Europe/Paris",
        }).format(new Date(user.naissance.dateDeNaissance))
      : "";

    // PAGE 1 (index 1)
    const page1 = pdfDoc.getPage(0);
    page1.drawText(
      `Monsieur ${user.nomDeNaissance} ${user.prenom} né le ${dateNaissanceFormatted} à ${user.naissance.communeDeNaissance}, de nationalité ${user.naissance.paysDeNaissance}, \nimmatriculé à la sécurité sociale sous le numéro ${user.numeroSecuriteSociale}, \ndemeurant au ${user.adresse.adresse} - ${user.adresse.codePostal} ${user.adresse.ville}`,
      { x: 38, y: 360, size: 11, font, lineHeight: 14 }
    );

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
