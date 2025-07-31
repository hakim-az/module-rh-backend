import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ValidateUserUseCase } from "@/application/use-cases/auth/validate-user.use-case";
import { LoginUseCase } from "@/application/use-cases/auth/login.use-case";
import { DatabaseModule } from "@infrastructure/modules/database.module";

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: "your-secret-key",
      signOptions: { expiresIn: "1h" },
    }),
  ],
  providers: [ValidateUserUseCase, LoginUseCase],
  exports: [ValidateUserUseCase, LoginUseCase],
})
export class AuthModule {}
