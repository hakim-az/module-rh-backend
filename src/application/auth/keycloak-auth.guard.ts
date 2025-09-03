// auth/keycloak-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import * as jwt from "jsonwebtoken";
import * as jwksClient from "jwks-rsa";

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  private client = jwksClient({
    jwksUri: `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
  });

  private async getSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.getSigningKey(kid, (err, key) => {
        if (err) {
          return reject(err);
        }
        const signingKey = key.getPublicKey();
        resolve(signingKey);
      });
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decodedHeader: any = jwt.decode(token, { complete: true });

    if (!decodedHeader?.header?.kid) {
      throw new UnauthorizedException("Invalid token header");
    }

    const signingKey = await this.getSigningKey(decodedHeader.header.kid);

    try {
      const payload: any = jwt.verify(token, signingKey, {
        algorithms: ["RS256"],
      });

      (request as any).user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }
}
