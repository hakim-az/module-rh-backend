import { Module } from "@nestjs/common";
import { EmailVerificationService } from "../use-cases/EmailVerification/email-verification.use-case";
import { DatabaseModule } from "@/infrastructure/modules/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
