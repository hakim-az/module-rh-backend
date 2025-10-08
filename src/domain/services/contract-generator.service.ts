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
  private readonly templateCdiMT = "templates/template-contrat-cdi-MT.pdf";
  private readonly templateCdiTéléconseillerFR =
    "templates/template-contrat-téléconseiller-FR.pdf";

  // ---------------- v2 templates -------------------------
  private readonly templateCdiWC = "templates-v2/template-cdi-wc-v2.pdf";
  private readonly templateCdiFT = "templates-v2/template-cdi-ft-v2.pdf";
  private readonly templateCdiAP = "templates-v2/template-cdi-ap-v2.pdf";

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

  async generateFranceTelephoneTéléconseillerCDIContract(
    contart: any
  ): Promise<Buffer> {
    let templateBytes: Buffer;

    // Get user who owns the contract
    const user = await this.getUserUseCase.execute(contart.idUser);

    try {
      // ✅ Fetch the template from AWS S3 instead of local file
      templateBytes = await this.s3Service.downloadFile(
        this.templateCdiTéléconseillerFR
      );
    } catch {
      throw new NotFoundException(
        `Template PDF non trouvé dans S3 : ${this.templateCdiTéléconseillerFR}`
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
    const page5 = pdfDoc.getPage(4);

    // ------------------------------------------------PAGE 01 ---------------------------------------------
    // PAGE 1 (index 1) -- GOOD
    const civiliteLabel = user.civilite === "m" ? "Monsieur" : "Madame";
    const ne = user.civilite === "m" ? "né" : "née";
    const immatricule = user.civilite === "m" ? "Immatriculé" : "Immatriculée";

    page1.drawText(
      `${civiliteLabel} ${user.nomDeNaissance} ${user.prenom}, ${ne} le ${dateNaissanceFormatted} à ${user.naissance.communeDeNaissance}, de nationalité ${nationality},\n${immatricule} à la sécurité sociale sous le numéro ${user.numeroSecuriteSociale}, \nDemeurant au ${user.adresse.adresse} - ${user.adresse.codePostal} ${user.adresse.ville}.`,
      { x: 42, y: 370, size: 11, font, lineHeight: 14 }
    );

    // PAGE 1 (index 2)
    page1.drawText(`${dateDebutFormatted}`, {
      x: 380,
      y: 90,
      size: 11,
      font: fontBold,
    });

    // ------------------------------------------------PAGE 02 ---------------------------------------------
    // PAGE 2 (index 1)
    page2.drawText(`${dateDebutFormatted}`, {
      x: 405,
      y: 725,
      size: 11,
      font: fontBold,
    });

    // ------------------------------------------------PAGE 05 ---------------------------------------------
    // PAGE 5 (index 1) -- GOOD
    page5.drawText(`${formatDateFr(new Date())}`, {
      x: 185,
      y: 115,
      size: 11,
      font: fontBold,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async generateMondialTVCDIContract(contart: any): Promise<Buffer> {
    let templateBytes: Buffer;

    // Get user who owns the contract
    const user = await this.getUserUseCase.execute(contart.idUser);

    try {
      // ✅ Fetch the template from AWS S3 instead of local file
      templateBytes = await this.s3Service.downloadFile(this.templateCdiMT);
    } catch {
      throw new NotFoundException(
        `Template PDF non trouvé dans S3 : ${this.templateCdiMT}`
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

    const dateFinFormatted = contart.dateFin
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
    const page4 = pdfDoc.getPage(3);
    const page5 = pdfDoc.getPage(4);

    // ------------------------------------------------ PAGE 01 ---------------------------------------------
    // PAGE 1 (index 1) -- GOOD
    const civiliteLabel = user.civilite === "m" ? "Monsieur" : "Madame";
    const ne = user.civilite === "m" ? "né" : "née";
    const immatricule = user.civilite === "m" ? "Immatriculé" : "Immatriculée";

    page1.drawText(
      `${civiliteLabel} ${user.nomDeNaissance} ${user.prenom}, ${ne} le ${dateNaissanceFormatted} à ${user.naissance.communeDeNaissance}, de nationalité ${nationality},\n${immatricule} à la sécurité sociale sous le numéro ${user.numeroSecuriteSociale}, \nDemeurant au ${user.adresse.adresse} - ${user.adresse.codePostal} ${user.adresse.ville}.`,
      { x: 37, y: 514, size: 11, font, lineHeight: 14 }
    );

    // PAGE 1 (index 2) -- GOOD
    page1.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 390,
      y: 350,
      size: 11,
      font: fontBold,
    });

    // PAGE 1 (index 3) -- GOOD
    page1.drawText(`${contart.poste}`, {
      x: 330,
      y: 335,
      size: 11,
      font: fontBold,
    });

    // PAGE 1 (index 4) --GOOD
    page1.drawText(`${dateDebutFormatted}`, {
      x: 215,
      y: 298,
      size: 11,
      font: fontBold,
    });

    // PAGE 1 (index 5) -- GOOD
    page1.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 360,
      y: 298,
      size: 11,
      font: fontBold,
    });

    // PAGE 1 (index 6) -- GOOD
    page1.drawText(`${contart.poste}`, {
      x: 320,
      y: 272,
      size: 11,
      font: fontBold,
    });

    // PAGE 1 (index 7) -- GOOD
    page1.drawText(`${contart.missions}`, {
      x: 40,
      y: 200,
      size: 11,
      font,
      lineHeight: 8,
    });

    // ------------------------------------------------PAGE 02 ---------------------------------------------
    // PAGE 2 (index 1) -- GOOD
    page2.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 90,
      y: 749,
      size: 11,
      font: fontBold,
    });

    // PAGE 2 (index 2) -- GOOD
    page2.drawText(`${dateDebutFormatted}`, {
      x: 334,
      y: 749,
      size: 11,
      font: fontBold,
    });

    // PAGE 2 (index 3) -- GOOD
    page2.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 205,
      y: 712,
      size: 11,
      font: fontBold,
    });

    // PAGE 2 (index 4) -- GOOD
    page2.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 85,
      y: 146,
      size: 11,
      font: fontBold,
    });

    // PAGE 2 (index 5)-- GOOD
    page2.drawText(`${contart.salaire} €`, {
      x: 517,
      y: 146,
      size: 11,
      font: fontBold,
    });

    // ------------------------------------------------PAGE 04 ---------------------------------------------
    // PAGE 4 (index 1) -- GOOD
    page4.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 314,
      y: 520,
      size: 11,
      font: fontBold,
    });

    // ------------------------------------------------PAGE 05 ---------------------------------------------
    // PAGE 5 (index 1) -- GOOD
    page5.drawText(`${formatDateFr(new Date())}`, {
      x: 343,
      y: 646,
      size: 11,
      font: fontBold,
    });

    // PAGE 5 (index 2) -- GOOD
    page5.drawText(`${user.nomDeNaissance} ${user.prenom}`, {
      x: 85,
      y: 572,
      size: 11,
      font: fontBold,
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  // ---------------------------------- templates v2 ------------------------------------------------------------
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
    const page5 = pdfDoc.getPage(4);

    // ------------------------------------------------PAGE 01 ---------------------------------------------
    // PAGE 1 (index 1) -- good
    const civiliteLabel = user.civilite === "m" ? "Monsieur" : "Madame";
    const ne = user.civilite === "m" ? "né" : "née";
    const immatricule = user.civilite === "m" ? "Immatriculé" : "Immatriculée";

    const description = wrapTextByLength(
      `${civiliteLabel} ${user.nomDeNaissance.toUpperCase()} ${user.prenom.charAt(0).toUpperCase() + user.prenom.slice(1).toLowerCase()}, ${ne} le ${dateNaissanceFormatted} à ${user.naissance.communeDeNaissance}, de nationalité ${nationality}, ${immatricule} à la sécurité sociale sous le numéro ${user.numeroSecuriteSociale}, Demeurant au ${user.adresse.adresse} - ${user.adresse.codePostal} ${user.adresse.ville}.`,
      100
    );

    page1.drawText(description, {
      x: 37,
      y: 500,
      size: 11,
      font,
      lineHeight: 14,
    });

    // PAGE 1 (index 2)
    const engagamentFirst = wrapTextByLength(
      `Sous réserve des résultats de la visite médicale d'embauche, le salarié est engagé par la société WINVEST CAPITAL , en qualité de ${contart.poste} dans les conditions prévues par les articles L. 7311-1 et suivants du code du travail.`,
      100
    );

    const engagamentSecond = wrapTextByLength(
      `Le présent contrat prendra effet le ${dateDebutFormatted}. Le salarié déclare expressément ce jour ne pas être débiteur d'une obligation de non-concurrence incompatible avec son engagement par la société WINVEST CAPITAL en qualité de ${contart.poste}.`,
      100
    );

    page1.drawText(engagamentFirst, {
      x: 37,
      y: 350,
      size: 11,
      font,
      lineHeight: 14,
    });

    page1.drawText(engagamentSecond, {
      x: 37,
      y: 300,
      size: 11,
      font,
      lineHeight: 14,
    });

    // PAGE 1 (index 3)
    page1.drawText(contart.missions, {
      x: 37,
      y: 190,
      size: 11,
      font,
      lineHeight: 8,
    });

    // ------------------------------------------------PAGE 02 ---------------------------------------------
    // PAGE 2 (index 1)
    const dureeFirst = `Le salarié est engagé le ${dateDebutFormatted} à durée indéterminée.`;

    const dureeSecond = wrapTextByLength(
      `Compte tenu du fait que le salarié a précédemment effectué un stage au sein de la société sur des missions identiques à celles prévues dans le cadre du présent contrat, aucune période d'essai ne sera prévue, conformément à la jurisprudence et à l'esprit de l'article L.1221-19 du Code du travail.`,
      100
    );

    page2.drawText(dureeFirst, {
      x: 37,
      y: 695,
      size: 11,
      font,
      lineHeight: 14,
    });

    page2.drawText(dureeSecond, {
      x: 37,
      y: 675,
      size: 11,
      font,
      lineHeight: 14,
    });

    // PAGE 2 (index 2)
    const remuniration = `Le salarié percevra une rémunération mensuelle brute fixée à ${contart.salaire} €.`;

    page2.drawText(remuniration, {
      x: 37,
      y: 90,
      size: 11,
      font,
      lineHeight: 14,
    });

    // ------------------------------------------------PAGE 05 ---------------------------------------------
    // PAGE 5 (index 1)
    const currentDate = `Fait en deux exemplaires originaux à Fontenay-Sous-Bois, le ${formatDateFr(new Date())}`;

    page5.drawText(currentDate, {
      x: 37,
      y: 430,
      size: 11,
      font,
      lineHeight: 14,
    });

    page5.drawText(
      `${user.nomDeNaissance.toUpperCase()} ${user.prenom.charAt(0).toUpperCase() + user.prenom.slice(1).toLowerCase()}`,
      {
        x: 37,
        y: 360,
        size: 12,
        font: fontBold,
        lineHeight: 14,
      }
    );

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async generateFranceTelephoneCDIContract(contart: any): Promise<Buffer> {
    let templateBytes: Buffer;

    // Get user who owns the contract
    const user = await this.getUserUseCase.execute(contart.idUser);

    try {
      // ✅ Fetch the template from AWS S3 instead of local file
      templateBytes = await this.s3Service.downloadFile(this.templateCdiFT);
    } catch {
      throw new NotFoundException(
        `Template PDF non trouvé dans S3 : ${this.templateCdiFT}`
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

    const dateFinFormatted = contart.dateFin
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
    const page5 = pdfDoc.getPage(4);

    // ------------------------------------------------PAGE 01 ---------------------------------------------
    // PAGE 1 (index 1) -- good
    const civiliteLabel = user.civilite === "m" ? "Monsieur" : "Madame";
    const ne = user.civilite === "m" ? "né" : "née";
    const immatricule = user.civilite === "m" ? "Immatriculé" : "Immatriculée";

    const description = wrapTextByLength(
      `${civiliteLabel} ${user.nomDeNaissance.toUpperCase()} ${user.prenom.charAt(0).toUpperCase() + user.prenom.slice(1).toLowerCase()}, ${ne} le ${dateNaissanceFormatted} à ${user.naissance.communeDeNaissance}, de nationalité ${nationality}, ${immatricule} à la sécurité sociale sous le numéro ${user.numeroSecuriteSociale}, Demeurant au ${user.adresse.adresse} - ${user.adresse.codePostal} ${user.adresse.ville}.`,
      100
    );

    page1.drawText(description, {
      x: 37,
      y: 505,
      size: 11,
      font,
      lineHeight: 14,
    });

    // PAGE 1 (index 2)
    const engagamentFirst = wrapTextByLength(
      `Sous réserve des résultats de la visite médicale d'embauche, le salarié est engagé par la société France TÉLÉPHONE , en qualité de ${contart.poste} dans les conditions prévues par les articles L. 7311-1 et suivants du code du travail.`,
      100
    );

    const engagamentSecond = wrapTextByLength(
      `Le présent contrat prendra effet le ${dateDebutFormatted}. Le salarié déclare expressément ce jour ne pas être débiteur d'une obligation de non-concurrence incompatible avec son engagement par la société France TÉLÉPHONE en qualité de ${contart.poste}.`,
      100
    );

    page1.drawText(engagamentFirst, {
      x: 37,
      y: 350,
      size: 11,
      font,
      lineHeight: 14,
    });

    page1.drawText(engagamentSecond, {
      x: 37,
      y: 300,
      size: 11,
      font,
      lineHeight: 14,
    });

    // PAGE 1 (index 3)
    page1.drawText(contart.missions, {
      x: 37,
      y: 180,
      size: 11,
      font,
      lineHeight: 8,
    });

    // ------------------------------------------------PAGE 02 ---------------------------------------------
    // PAGE 2 (index 1)
    const dureeFirst = `Le salarié est engagé le ${dateDebutFormatted} à durée indéterminée.`;

    const dureeSecond = wrapTextByLength(
      `Compte tenu du fait que le salarié a précédemment effectué un stage au sein de la société sur des missions identiques à celles prévues dans le cadre du présent contrat, aucune période d'essai ne sera prévue, conformément à la jurisprudence et à l'esprit de l'article L.1221-19 du Code du travail.`,
      100
    );

    page2.drawText(dureeFirst, {
      x: 37,
      y: 740,
      size: 11,
      font,
      lineHeight: 14,
    });

    page2.drawText(dureeSecond, {
      x: 37,
      y: 720,
      size: 11,
      font,
      lineHeight: 14,
    });

    // PAGE 2 (index 2)
    const remuniration = `Le salarié percevra une rémunération mensuelle brute fixée à ${contart.salaire} €.`;

    page2.drawText(remuniration, {
      x: 37,
      y: 140,
      size: 11,
      font,
      lineHeight: 14,
    });

    // ------------------------------------------------PAGE 05 ---------------------------------------------
    // PAGE 5 (index 1)
    const currentDate = `Fait en deux exemplaires originaux à Fontenay-Sous-Bois, le ${formatDateFr(new Date())}`;

    page5.drawText(currentDate, {
      x: 37,
      y: 620,
      size: 11,
      font,
      lineHeight: 14,
    });

    page5.drawText(
      `${user.nomDeNaissance.toUpperCase()} ${user.prenom.charAt(0).toUpperCase() + user.prenom.slice(1).toLowerCase()}`,
      {
        x: 37,
        y: 550,
        size: 12,
        font: fontBold,
        lineHeight: 14,
      }
    );

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async generateActionPrevoyancCDIContract(contart: any): Promise<Buffer> {
    let templateBytes: Buffer;

    // Get user who owns the contract
    const user = await this.getUserUseCase.execute(contart.idUser);

    try {
      // ✅ Fetch the template from AWS S3 instead of local file
      templateBytes = await this.s3Service.downloadFile(this.templateCdiAP);
    } catch {
      throw new NotFoundException(
        `Template PDF non trouvé dans S3 : ${this.templateCdiAP}`
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

    const dateFinFormatted = contart.dateFin
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
    const page5 = pdfDoc.getPage(4);

    // ------------------------------------------------PAGE 01 ---------------------------------------------
    // PAGE 1 (index 1) -- good
    const civiliteLabel = user.civilite === "m" ? "Monsieur" : "Madame";
    const ne = user.civilite === "m" ? "né" : "née";
    const immatricule = user.civilite === "m" ? "Immatriculé" : "Immatriculée";

    const description = wrapTextByLength(
      `${civiliteLabel} ${user.nomDeNaissance.toUpperCase()} ${user.prenom.charAt(0).toUpperCase() + user.prenom.slice(1).toLowerCase()}, ${ne} le ${dateNaissanceFormatted} à ${user.naissance.communeDeNaissance}, de nationalité ${nationality}, ${immatricule} à la sécurité sociale sous le numéro ${user.numeroSecuriteSociale}, Demeurant au ${user.adresse.adresse} - ${user.adresse.codePostal} ${user.adresse.ville}.`,
      100
    );

    page1.drawText(description, {
      x: 37,
      y: 500,
      size: 11,
      font,
      lineHeight: 14,
    });

    // PAGE 1 (index 2)
    const engagamentFirst = wrapTextByLength(
      `Sous réserve des résultats de la visite médicale d'embauche, le salarié est engagé par la société ACTION PRÉVOYANCE, en qualité de ${contart.poste} dans les conditions prévues par les articles L. 7311-1 et suivants du code du travail.`,
      100
    );

    const engagamentSecond = wrapTextByLength(
      `Le présent contrat prendra effet le ${dateDebutFormatted}. Le salarié déclare expressément ce jour ne pas être débiteur d'une obligation de non-concurrence incompatible avec son engagement par la société ACTION PRÉVOYANCE en qualité de ${contart.poste}.`,
      100
    );

    page1.drawText(engagamentFirst, {
      x: 37,
      y: 350,
      size: 11,
      font,
      lineHeight: 14,
    });

    page1.drawText(engagamentSecond, {
      x: 37,
      y: 300,
      size: 11,
      font,
      lineHeight: 14,
    });

    // PAGE 1 (index 3)
    page1.drawText(contart.missions, {
      x: 37,
      y: 190,
      size: 11,
      font,
      lineHeight: 8,
    });

    // ------------------------------------------------PAGE 02 ---------------------------------------------
    // PAGE 2 (index 1)
    const dureeFirst = `Le salarié est engagé le ${dateDebutFormatted} à durée indéterminée.`;

    const dureeSecond = wrapTextByLength(
      `Compte tenu du fait que le salarié a précédemment effectué un stage au sein de la société sur des missions identiques à celles prévues dans le cadre du présent contrat, aucune période d'essai ne sera prévue, conformément à la jurisprudence et à l'esprit de l'article L.1221-19 du Code du travail.`,
      100
    );

    page2.drawText(dureeFirst, {
      x: 37,
      y: 725,
      size: 11,
      font,
      lineHeight: 14,
    });

    page2.drawText(dureeSecond, {
      x: 37,
      y: 705,
      size: 11,
      font,
      lineHeight: 14,
    });

    // PAGE 2 (index 2)
    const remuniration = `Le salarié percevra une rémunération mensuelle brute fixée à ${contart.salaire} €.`;

    page2.drawText(remuniration, {
      x: 37,
      y: 140,
      size: 11,
      font,
      lineHeight: 14,
    });

    // ------------------------------------------------PAGE 05 ---------------------------------------------
    // PAGE 5 (index 1)
    const currentDate = `Fait en deux exemplaires originaux à Fontenay-Sous-Bois, le ${formatDateFr(new Date())}`;

    page5.drawText(currentDate, {
      x: 37,
      y: 575,
      size: 11,
      font,
      lineHeight: 14,
    });

    page5.drawText(
      `${user.nomDeNaissance.toUpperCase()} ${user.prenom.charAt(0).toUpperCase() + user.prenom.slice(1).toLowerCase()}`,
      {
        x: 37,
        y: 505,
        size: 12,
        font: fontBold,
        lineHeight: 14,
      }
    );

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

export function wrapTextByLength(
  text: string,
  maxLength: number = 100
): string {
  if (!text) return "";
  let result = "";
  let start = 0;

  while (start < text.length) {
    if (text.length - start <= maxLength) {
      result += text.slice(start);
      break;
    }

    // Cherche le dernier espace avant la limite
    let end = text.lastIndexOf(" ", start + maxLength);
    if (end <= start) {
      // s’il n’y a pas d’espace, coupe simplement à 100
      end = start + maxLength;
    }

    result += text.slice(start, end) + "\n";
    start = end + 1; // saute l’espace
  }

  return result.trim();
}
