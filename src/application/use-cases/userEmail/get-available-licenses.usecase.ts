import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import axios, { AxiosError } from "axios";

@Injectable()
export class GetAvailableLicensesUseCase {
  private readonly logger = new Logger(GetAvailableLicensesUseCase.name);

  private readonly tenantId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly graphScope = "https://graph.microsoft.com/.default";
  private readonly tokenUrl: string;

  constructor() {
    this.tenantId = process.env.AZURE_TENANT_ID ?? "";
    this.clientId = process.env.AZURE_CLIENT_ID ?? "";
    this.clientSecret = process.env.AZURE_CLIENT_SECRET ?? "";

    if (!this.tenantId || !this.clientId || !this.clientSecret) {
      throw new InternalServerErrorException(
        "Missing Microsoft Graph environment variables"
      );
    }

    this.tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
  }

  private async getAccessToken(): Promise<string> {
    try {
      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "client_credentials",
        scope: this.graphScope,
      });

      const response = await axios.post(this.tokenUrl, params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (!response.data?.access_token) {
        throw new BadRequestException("Failed to obtain Graph API token");
      }

      return response.data.access_token;
    } catch (error: any) {
      this.logger.error(
        "❌ Error obtaining Microsoft Graph token",
        error?.response?.data ?? error?.message
      );
      throw new InternalServerErrorException(
        "Failed to obtain Graph access token"
      );
    }
  }

  async execute(): Promise<
    {
      skuId: string;
      skuPartNumber: string;
      enabled: number;
      consumed: number;
    }[]
  > {
    const token = await this.getAccessToken();
    const url = "https://graph.microsoft.com/v1.0/subscribedSkus";
    this.logger.log("Fetching available Microsoft 365 licenses...");

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status !== 200) {
        this.logger.error(
          `❌ Failed to fetch licenses (${response.status})`,
          response.data
        );
        throw new BadRequestException("Failed to retrieve licenses");
      }

      const licenses = response.data.value.map((lic: any) => ({
        skuId: lic.skuId,
        skuPartNumber: lic.skuPartNumber,
        enabled: lic.prepaidUnits?.enabled ?? 0,
        consumed: lic.consumedUnits ?? 0,
      }));

      this.logger.log(`✅ Retrieved ${licenses.length} licenses from tenant`);
      return licenses;
    } catch (error: any) {
      const axiosError = error as AxiosError;
      this.logger.error(
        "❌ Error fetching Microsoft 365 licenses",
        axiosError.response?.data ?? axiosError.message
      );

      // Provide more context in the exception
      throw new InternalServerErrorException({
        message: "Failed to fetch Microsoft 365 licenses",
        graphError: axiosError.response?.data ?? axiosError.message,
      });
    }
  }
}
