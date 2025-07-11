import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import * as FormData from "form-data";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

@Injectable()
export class YousignService {
  private BASE_URL: string;
  private API_KEY: string;

  constructor(private configService: ConfigService) {
    this.BASE_URL = this.configService.get<string>("YOUSIGN_BASE_URL");
    this.API_KEY = this.configService.get<string>("YOUSIGN_API_KEY");

    if (!this.BASE_URL || !this.API_KEY) {
      throw new Error(
        `Missing YOUSIGN_BASE_URL or YOUSIGN_API_KEY in environment variables.\nBASE_URL: ${this.BASE_URL}\nAPI_KEY: ${this.API_KEY}`
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
    } catch (e) {
      throw new HttpException(
        "Error on YouSign API call",
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  // 1- Create Signature Request
  async createSignatureRequest() {
    const body = {
      name: "Signature request from NestJS",
      delivery_mode: "email",
      timezone: "Europe/Paris",
    };
    return this.request(
      "signature_requests",
      {
        method: "POST",
        data: body,
      },
      {
        "Content-Type": "application/json",
      }
    );
  }

  // 2- Upload Document
  async uploadDocument(signatureRequestId: string, filePath: string) {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath), {
      filename: path.basename(filePath),
    });
    form.append("nature", "signable_document");
    form.append("parse_anchors", "true");

    return this.request(
      `signature_requests/${signatureRequestId}/documents`,
      {
        method: "POST",
        data: form,
      },
      form.getHeaders()
    );
  }

  // Add Signer
  async addSigner(
    signatureRequestId: string,
    documentId: string,
    firstName: string,
    lastName: string,
    email: string
  ) {
    const body = {
      info: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: "+33601234567",
        locale: "fr",
      },
      signature_level: "electronic_signature",
      signature_authentication_mode: "no_otp",
      fields: [
        {
          document_id: documentId,
          type: "signature",
          page: 4,
          x: 345,
          y: 592,
          width: 150,
          height: 50,
        },
      ],
    };

    return this.request(
      `signature_requests/${signatureRequestId}/signers`,
      {
        method: "POST",
        data: body,
      },
      {
        "Content-Type": "application/json",
      }
    );
  }

  // Activate Signature Request
  async activateSignatureRequest(signatureRequestId: string) {
    return this.request(`signature_requests/${signatureRequestId}/activate`, {
      method: "POST",
    });
  }

  // Download File
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
