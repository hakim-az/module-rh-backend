import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common";
import axios from "axios";
import * as jwt from "jsonwebtoken";

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);
  private readonly keycloakUrl = process.env.KEYCLOAK_BASE_URL;
  private readonly keycloakRealm = process.env.KEYCLOAK_REALM;
  private readonly clientId = process.env.KEYCLOAK_CLIENT_ID;
  private readonly clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  async verifyEmailToken(token: string) {
    try {
      // Decode JWT to get user ID
      const decoded: any = jwt.decode(token);
      if (!decoded?.sub) {
        throw new HttpException(
          { success: false, message: "Token invalide", error: "INVALID_TOKEN" },
          HttpStatus.BAD_REQUEST
        );
      }

      const userId = decoded.sub;

      // Get admin token
      const adminToken = await this.getAdminToken();

      // Get current user representation
      const { data: user } = await axios.get(
        `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users/${userId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      // Update only what's needed
      await axios.put(
        `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users/${userId}`,
        {
          ...user,
          emailVerified: true,
          requiredActions: [],
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      // Small delay to ensure Keycloak propagates changes
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms

      this.logger.log(`Email verified for user ${userId}`);
      return { success: true, message: "Email vérifié avec succès !" };
    } catch (error: any) {
      this.logger.error(
        "Failed to verify email",
        error.response?.data || error.message
      );
      throw new HttpException(
        {
          success: false,
          message:
            error.response?.data?.errorMessage ||
            "Échec de la vérification de l'email",
          error: "VERIFICATION_FAILED",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async getAdminToken(): Promise<string> {
    const res = await axios.post(
      `${this.keycloakUrl}/realms/${this.keycloakRealm}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return res.data.access_token;
  }
}
