// import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common";
// import axios from "axios";
// import { ResendVerificationDto } from "@/application/dtos/resend-verification.dto";
// import { CheckVerificationDto } from "@/application/dtos/check-verification.dto";

// @Injectable()
// export class EmailVerificationService {
//   private readonly logger = new Logger(EmailVerificationService.name);
//   private readonly keycloakUrl = process.env.KEYCLOAK_BASE_URL;
//   private readonly keycloakRealm = process.env.KEYCLOAK_REALM;
//   private readonly clientId = process.env.KEYCLOAK_CLIENT_ID;
//   private readonly clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

//   /**
//    * Resend verification email via Keycloak Admin API
//    */
//   async resendVerification(dto: ResendVerificationDto) {
//     try {
//       const { email } = dto;
//       this.logger.log(`Resending verification email to: ${email}`);

//       const adminToken = await this.getAdminToken();

//       // Find user by email
//       const usersRes = await axios.get(
//         `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users?email=${encodeURIComponent(email)}`,
//         { headers: { Authorization: `Bearer ${adminToken}` } }
//       );

//       const user = usersRes.data[0];
//       if (!user) {
//         throw new HttpException(
//           {
//             success: false,
//             message: "Aucun compte trouvé avec cette adresse email",
//             error: "EMAIL_NOT_FOUND",
//           },
//           HttpStatus.NOT_FOUND
//         );
//       }

//       // Send verification email
//       await axios.put(
//         `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users/${user.id}/send-verify-email`,
//         {},
//         { headers: { Authorization: `Bearer ${adminToken}` } }
//       );

//       return {
//         success: true,
//         message: "Email de vérification envoyé avec succès !",
//       };
//     } catch (error) {
//       this.logger.error(
//         "Failed to resend verification email",
//         error.response?.data || error.message
//       );
//       throw new HttpException(
//         {
//           success: false,
//           message: "Erreur lors de l'envoi de l'email de vérification",
//           error: "RESEND_FAILED",
//         },
//         HttpStatus.INTERNAL_SERVER_ERROR
//       );
//     }
//   }

//   /**
//    * Check if the user's email is verified
//    */
//   async checkEmailVerificationStatus(email: string) {
//     try {
//       const adminToken = await this.getAdminToken();

//       // Find user by email
//       const usersRes = await axios.get(
//         `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users?email=${encodeURIComponent(email)}`,
//         { headers: { Authorization: `Bearer ${adminToken}` } }
//       );

//       const user = usersRes.data[0];
//       if (!user) {
//         throw new HttpException(
//           {
//             success: false,
//             message: "Utilisateur non trouvé",
//             error: "USER_NOT_FOUND",
//           },
//           HttpStatus.NOT_FOUND
//         );
//       }

//       return { success: true, emailVerified: user.emailVerified };
//     } catch (error) {
//       this.logger.error(
//         "Failed to check email verification",
//         error.response?.data || error.message
//       );
//       throw new HttpException(
//         {
//           success: false,
//           message: "Impossible de vérifier l'état de l'email",
//           error: "VERIFICATION_CHECK_FAILED",
//         },
//         HttpStatus.INTERNAL_SERVER_ERROR
//       );
//     }
//   }

//   /**
//    * Helper: Get Keycloak admin token
//    */
//   private async getAdminToken(): Promise<string> {
//     const res = await axios.post(
//       `${this.keycloakUrl}/realms/${this.keycloakRealm}/protocol/openid-connect/token`,
//       new URLSearchParams({
//         grant_type: "client_credentials",
//         client_id: this.clientId,
//         client_secret: this.clientSecret,
//       }),
//       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//     );
//     return res.data.access_token;
//   }
// }

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

      // Update user emailVerified to true
      await axios.put(
        `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users/${userId}`,
        { emailVerified: true, requiredActions: [] },
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
