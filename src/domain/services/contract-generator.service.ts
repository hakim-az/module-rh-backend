// src/modules/contract-generator/contract-generator.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { S3Service } from "./s3.service";
import { GetUserUseCase } from "@/application/use-cases/user/get-user.use-case";
import { nationalitiesData } from "@/application/__mock__/nationalities";

@Injectable()
export class ContractGeneratorService {
  private readonly templateFR = "templates/template-contart-FR.pdf";
  private readonly templateAP = "templates/template-contart-AP.pdf";
  private readonly templateCdiWC = "templates/template-contrat-cdi-WC.pdf";

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
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const dateNaissanceFormatted = user.naissance.dateDeNaissance
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "Europe/Paris",
        }).format(new Date(user.naissance.dateDeNaissance))
      : "";

    // 🔎 Trouver la nationalité à partir du code (value) et la mettre en "Capitalized"
    const nationality = nationalitiesData.find(
      (n) => n.value === String(user.naissance.paysDeNaissance)
    )
      ? nationalitiesData
          .find((n) => n.value === String(user.naissance.paysDeNaissance))!
          .label.charAt(0)
          .toUpperCase() +
        nationalitiesData
          .find((n) => n.value === String(user.naissance.paysDeNaissance))!
          .label.slice(1)
          .toLowerCase()
      : "";

    // all pages
    const page1 = pdfDoc.getPage(0);
    const page2 = pdfDoc.getPage(1);
    const page12 = pdfDoc.getPage(11);

    // PAGE 1 (index 1) -- GOOD
    page1.drawText(
      `M./Mme ${user.nomDeNaissance} ${user.prenom} né le ${dateNaissanceFormatted} à ${user.naissance.communeDeNaissance}, de nationalité ${nationality}, \nImmatriculé à la sécurité sociale sous le numéro ${user.numeroSecuriteSociale}, \nDemeurant au ${user.adresse.adresse} - ${user.adresse.codePostal} ${user.adresse.ville}.`,
      { x: 38, y: 360, size: 11, font, lineHeight: 14 }
    );

    // PAGE 1 (index 2) -- GOOD
    page1.drawText(`${formatDateFr(contart.dateDebut)}`, {
      x: 210,
      y: 95,
      size: 11,
      font: fontBold,
    });

    // PAGE 2 (index 1)
    page2.drawText(`${formatDateFr(contart.dateDebut)}`, {
      x: 405,
      y: 452,
      size: 11,
      font: fontBold,
    });

    // PAGE 12 (index 1)
    page12.drawText(`${formatDateFr(new Date())}`, {
      x: 180,
      y: 697,
      size: 11,
      font: fontBold,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async generateActionPrevoyanceContract(contart: any): Promise<Buffer> {
    let templateBytes: Buffer;

    // Get user who owns the contract
    const user = await this.getUserUseCase.execute(contart.idUser);

    try {
      // ✅ Fetch the template from AWS S3 instead of local file
      templateBytes = await this.s3Service.downloadFile(this.templateAP);
    } catch {
      throw new NotFoundException(
        `Template PDF non trouvé dans S3 : ${this.templateAP}`
      );
    }

    const pdfDoc = await PDFDocument.load(templateBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const dateNaissanceFormatted = user.naissance.dateDeNaissance
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "Europe/Paris",
        }).format(new Date(user.naissance.dateDeNaissance))
      : "";

    // 🔎 Trouver la nationalité à partir du code (value) et la mettre en "Capitalized"
    const nationality = nationalitiesData.find(
      (n) => n.value === String(user.naissance.paysDeNaissance)
    )
      ? nationalitiesData
          .find((n) => n.value === String(user.naissance.paysDeNaissance))!
          .label.charAt(0)
          .toUpperCase() +
        nationalitiesData
          .find((n) => n.value === String(user.naissance.paysDeNaissance))!
          .label.slice(1)
          .toLowerCase()
      : "";

    // all pages
    const page1 = pdfDoc.getPage(0);
    const page2 = pdfDoc.getPage(1);
    const page11 = pdfDoc.getPage(10);

    // PAGE 1 (index 1) -- GOOD
    page1.drawText(
      `M./Mme ${user.nomDeNaissance} ${user.prenom} né le ${dateNaissanceFormatted} à ${user.naissance.communeDeNaissance}, de nationalité ${nationality}, \nImmatriculé à la sécurité sociale sous le numéro ${user.numeroSecuriteSociale}, \nDemeurant au ${user.adresse.adresse} - ${user.adresse.codePostal} ${user.adresse.ville}.`,
      { x: 37, y: 460, size: 11, font, lineHeight: 14 }
    );

    // PAGE 1 (index 2) -- GOOD
    page1.drawText(`${formatDateFr(contart.dateDebut)}`, {
      x: 210,
      y: 170,
      size: 11,
      font: fontBold,
    });

    // PAGE 2 (index 1)
    page2.drawText(`${formatDateFr(contart.dateDebut)}`, {
      x: 400,
      y: 463,
      size: 11,
      font: fontBold,
    });

    // PAGE 11 (index 1)
    page11.drawText(`${formatDateFr(new Date())}`, {
      x: 185,
      y: 582,
      size: 11,
      font: fontBold,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async generateWinvestCapitalCDIContract(contart: any): Promise<Buffer> {
    let templateBytes: Buffer;

    // Get user who owns the contract
    const user = await this.getUserUseCase.execute(contart.idUser);

    try {
      // ✅ Fetch the template from AWS S3 instead of local file
      templateBytes = await this.s3Service.downloadFile(this.templateCdiWC);
    } catch {
      throw new NotFoundException(
        `Template PDF non trouvé dans S3 : ${this.templateCdiWC}`
      );
    }

    const pdfDoc = await PDFDocument.load(templateBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const dateNaissanceFormatted = user.naissance.dateDeNaissance
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "Europe/Paris",
        }).format(new Date(user.naissance.dateDeNaissance))
      : "";

    const dateDebutFormatted = contart.dateDebut
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "Europe/Paris",
        }).format(new Date(contart.dateDebut))
      : "";

    // 🔎 Trouver la nationalité à partir du code (value) et la mettre en "Capitalized"
    const nationality = nationalitiesData.find(
      (n) => n.value === String(user.naissance.paysDeNaissance)
    )
      ? nationalitiesData
          .find((n) => n.value === String(user.naissance.paysDeNaissance))!
          .label.charAt(0)
          .toUpperCase() +
        nationalitiesData
          .find((n) => n.value === String(user.naissance.paysDeNaissance))!
          .label.slice(1)
          .toLowerCase()
      : "";

    // all pages
    const page1 = pdfDoc.getPage(0);
    const page2 = pdfDoc.getPage(1);
    const page3 = pdfDoc.getPage(2);
    const page4 = pdfDoc.getPage(3);
    const page5 = pdfDoc.getPage(4);

    // ------------------------------------------------PAGE 01 ---------------------------------------------
    // PAGE 1 (index 1) -- GOOD
    page1.drawText(
      `M./Mme ${user.nomDeNaissance} ${user.prenom} né le ${dateNaissanceFormatted} à ${user.naissance.communeDeNaissance}, de nationalité ${nationality}, \nImmatriculé à la sécurité sociale sous le numéro ${user.numeroSecuriteSociale}, \nDemeurant au ${user.adresse.adresse} - ${user.adresse.codePostal} ${user.adresse.ville}.`,
      { x: 37, y: 415, size: 11, font, lineHeight: 14 }
    );

    // PAGE 1 (index 2)  -- GOOD
    page1.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 390,
      y: 245,
      size: 11,
      font: fontBold,
    });

    // PAGE 1 (index 3)  -- GOOD
    page1.drawText(`${dateDebutFormatted}`, {
      x: 210,
      y: 195,
      size: 11,
      font: fontBold,
    });

    // PAGE 1 (index 4)  -- GOOD
    page1.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 360,
      y: 195,
      size: 11,
      font: fontBold,
    });

    // PAGE 1 (index 5)  -- GOOD
    page1.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 85,
      y: 105,
      size: 11,
      font: fontBold,
    });

    // ------------------------------------------------PAGE 02 ---------------------------------------------
    // PAGE 2 (index 1)  -- GOOD
    page2.drawText(`${contart.missions}`, {
      x: 37,
      y: 680,
      size: 11,
      font,
      lineHeight: 8,
    });

    // PAGE 2 (index 2)  -- GOOD
    page2.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 90,
      y: 545,
      size: 11,
      font: fontBold,
    });

    // PAGE 2 (index 3)  -- GOOD
    page2.drawText(`${dateDebutFormatted}`, {
      x: 340,
      y: 545,
      size: 11,
      font: fontBold,
    });

    // PAGE 2 (index 4)  -- GOOD
    page2.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 210,
      y: 522,
      size: 11,
      font: fontBold,
    });
    // ------------------------------------------------PAGE 03 ---------------------------------------------
    // PAGE 3 (index 1)  -- GOOD
    page3.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 90,
      y: 595,
      size: 11,
      font: fontBold,
    });

    // PAGE 3 (index 2)  -- GOOD
    page3.drawText(`${contart.salaire} Euros`, {
      x: 510,
      y: 595,
      size: 11,
      font: fontBold,
    });
    // ------------------------------------------------PAGE 04 ---------------------------------------------
    // PAGE 4 (index 1)  -- GOOD
    page4.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 275,
      y: 250,
      size: 11,
      font: fontBold,
    });

    // ------------------------------------------------PAGE 05 ---------------------------------------------
    // PAGE 5 (index 1)  -- GOOD
    page5.drawText(`${formatDateFr(new Date())}`, {
      x: 345,
      y: 302,
      size: 11,
      font: fontBold,
    });

    // PAGE 5 (index 2)  -- GOOD
    page5.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 90,
      y: 225,
      size: 11,
      font: fontBold,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}

export function formatDateFr(date: Date | string | null | undefined): string {
  if (!date) return "";

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) return ""; // invalid date fallback

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(parsedDate);
}
