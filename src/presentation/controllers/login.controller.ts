// auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from "@nestjs/common";
import axios, { AxiosResponse } from "axios";

interface LoginDto {
  username: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: string;
  scope?: string;
}

@Controller("login")
export class LoginController {
  private readonly KEYCLOAK_BASE_URL = process.env.KEYCLOAK_BASE_URL;
  private readonly REALM = process.env.KEYCLOAK_REALM;
  private readonly CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
  private readonly CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;

  @Post()
  async login(@Body() body: LoginDto): Promise<AuthResponse> {
    if (!body || !body.username || !body.password) {
      throw new UnauthorizedException("username and password are required");
    }

    const { username, password } = body;

    const params = new URLSearchParams();
    params.append("client_id", this.CLIENT_ID);
    params.append("client_secret", this.CLIENT_SECRET);
    params.append("grant_type", "password");
    params.append("username", username);
    params.append("password", password);

    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${this.KEYCLOAK_BASE_URL}/realms/${this.REALM}/protocol/openid-connect/token`,
        params.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.error_description ||
        error.response?.data?.error ||
        "Login failed";
      throw new UnauthorizedException(message);
    }
  }
}
