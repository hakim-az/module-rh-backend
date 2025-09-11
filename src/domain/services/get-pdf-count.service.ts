import * as fs from "fs";
import { PDFDocument } from "pdf-lib";

export async function getPdfPageCount(filePath: string): Promise<number> {
  const fileBytes = fs.readFileSync(filePath); // ← ici fs doit être défini
  const pdfDoc = await PDFDocument.load(fileBytes);
  return pdfDoc.getPageCount();
}
