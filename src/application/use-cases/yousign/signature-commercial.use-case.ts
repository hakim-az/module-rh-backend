import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import * as FormData from "form-data";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

interface SignatureField {
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface Signer {
  firstName: string;
  lastName: string;
  email: string;
  fields: SignatureField[];
  phoneNumber?: string;
  locale?: string;
}

@Injectable()
export class YousignServiceCommercial {
  private BASE_URL: string;
  private API_KEY: string;

  constructor(private configService: ConfigService) {
    this.BASE_URL = this.configService.get<string>("YOUSIGN_BASE_URL");
    this.API_KEY = this.configService.get<string>("YOUSIGN_API_KEY");

    if (!this.BASE_URL || !this.API_KEY) {
      throw new Error(
        `Missing YOUSIGN_BASE_URL or YOUSIGN_API_KEY in environment variables.`
      );
    }
  }

  private async request(endpoint: string, options: any = {}, headers = {}) {
    const url = `${this.BASE_URL}/${endpoint}`;
    try {
      const res = await axios({
        url,
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          ...headers,
        },
        ...options,
      });
      return res.data;
    } catch (e: any) {
      console.error("YouSign API call failed:", {
        endpoint,
        status: e.response?.status,
        data: e.response?.data,
        message: e.message,
      });
      throw new HttpException(
        "Error on YouSign API call",
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  // 1️⃣ Créer la signature request
  async createSignatureRequest(name = "Contrat de travail") {
    const body = { name, delivery_mode: "email", timezone: "Europe/Paris" };
    return this.request(
      "signature_requests",
      { method: "POST", data: body },
      { "Content-Type": "application/json" }
    );
  }

  // 2️⃣ Upload d’un document
  async uploadDocument(signatureRequestId: string, filePath: string) {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath), {
      filename: path.basename(filePath),
    });
    form.append("nature", "signable_document");
    form.append("parse_anchors", "true");

    return this.request(
      `signature_requests/${signatureRequestId}/documents`,
      { method: "POST", data: form },
      form.getHeaders()
    );
  }

  // 3️⃣ Ajouter les signataires avec leurs champs de signature
  async addSigners(
    signatureRequestId: string,
    documentId: string,
    signers: Signer[]
  ) {
    for (const signer of signers) {
      const fields = signer.fields.map((f) => ({
        document_id: documentId,
        type: "signature",
        page: f.page,
        x: f.x,
        y: f.y,
        width: f.width ?? 150,
        height: f.height ?? 50,
      }));

      const body = {
        info: {
          first_name: signer.firstName,
          last_name: signer.lastName,
          email: signer.email,
          phone_number: signer.phoneNumber ?? "+33601234567",
          locale: signer.locale ?? "fr",
        },
        signature_level: "electronic_signature",
        signature_authentication_mode: "no_otp",
        fields,
      };

      await this.request(
        `signature_requests/${signatureRequestId}/signers`,
        { method: "POST", data: body },
        { "Content-Type": "application/json" }
      );
    }
  }

  // 4️⃣ Activer la signature request
  async activateSignatureRequest(signatureRequestId: string) {
    return this.request(`signature_requests/${signatureRequestId}/activate`, {
      method: "POST",
    });
  }

  // 5️⃣ Télécharger un fichier depuis une URL
  async downloadFile(url: string): Promise<string> {
    const tmpPath = path.join(os.tmpdir(), `contract_${Date.now()}.pdf`);
    const writer = fs.createWriteStream(tmpPath);

    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error = null;
      writer.on("error", (err) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on("close", () => {
        if (!error) resolve(tmpPath);
      });
    });
  }
}
