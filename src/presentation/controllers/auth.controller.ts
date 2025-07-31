import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ValidateUserUseCase } from "@/application/use-cases/auth/validate-user.use-case";
import { LoginUseCase } from "@/application/use-cases/auth/login.use-case";
import { LoginDto } from "@/application/dtos/login.dro";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly validateUserUseCase: ValidateUserUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  @Post("login")
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto) {
    const user = await this.validateUserUseCase.execute(
      body.email,
      body.password
    );
    return this.loginUseCase.execute(user);
  }
}
