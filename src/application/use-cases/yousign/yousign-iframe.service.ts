import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import * as FormData from "form-data";

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
export class YousignIframeService {
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
        timeout: 15000,
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
        `YouSign API call failed: ${e.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async createSignatureRequest(name = "Contrat de travail") {
    const body = {
      name,
      delivery_mode: "none", // embedded signature
      timezone: "Europe/Paris",
    };
    return this.request(
      "signature_requests",
      { method: "POST", data: body },
      { "Content-Type": "application/json" }
    );
  }

  // ⬇️ Now expects a Buffer instead of a path
  async uploadDocument(
    signatureRequestId: string,
    buffer: Buffer,
    filename: string
  ) {
    const form = new FormData();
    form.append("file", buffer, { filename });
    form.append("nature", "signable_document");
    form.append("parse_anchors", "true");

    return this.request(
      `signature_requests/${signatureRequestId}/documents`,
      { method: "POST", data: form },
      form.getHeaders()
    );
  }

  async addSigners(
    signatureRequestId: string,
    documentId: string,
    signers: Signer[]
  ) {
    return Promise.all(
      signers.map((signer) => {
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

        return this.request(
          `signature_requests/${signatureRequestId}/signers`,
          { method: "POST", data: body },
          { "Content-Type": "application/json" }
        );
      })
    );
  }

  async activateSignatureRequest(signatureRequestId: string) {
    return this.request(`signature_requests/${signatureRequestId}/activate`, {
      method: "POST",
    });
  }

  async getSignedDocuments(signatureRequestId: string) {
    return this.request(`signature_requests/${signatureRequestId}/documents`, {
      method: "GET",
    });
  }

  async getSignerUrl(
    signatureRequestId: string,
    signerId: string
  ): Promise<string> {
    const response = await this.request(
      `signature_requests/${signatureRequestId}/signers/${signerId}`,
      { method: "GET" }
    );

    if (!response?.signature_link) {
      throw new HttpException(
        "Unable to get signer URL",
        HttpStatus.BAD_GATEWAY
      );
    }

    return response.signature_link;
  }

  async downloadSignedDocument(
    signatureRequestId: string,
    documentId: string
  ): Promise<Buffer> {
    const url = `${this.BASE_URL}/signature_requests/${signatureRequestId}/documents/${documentId}/download`;

    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
        },
      });
      return Buffer.from(response.data);
    } catch (e: any) {
      console.error("Failed to download signed document:", {
        signatureRequestId,
        documentId,
        status: e.response?.status,
        message: e.message,
      });
      throw new HttpException(
        `Failed to download signed document: ${e.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async getSignatureRequestStatus(signatureRequestId: string) {
    return this.request(`signature_requests/${signatureRequestId}`, {
      method: "GET",
    });
  }

  // ✅ Download directly as Buffer (no temp file anymore)
  async downloadFileBuffer(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  }
}
