import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { EmailVerificationService } from "@/application/use-cases/EmailVerification/email-verification.use-case";

@Controller("api/email-verification")
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService
  ) {}

  @Post("verify")
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body("token") token: string) {
    return this.emailVerificationService.verifyEmailToken(token);
  }
}
