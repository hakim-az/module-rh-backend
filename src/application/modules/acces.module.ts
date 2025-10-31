import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/infrastructure/modules/database.module";
import { CreateUserEmailUseCase } from "../use-cases/userEmail/create-user-email.use-case";
import { GetUserEmailUseCase } from "../use-cases/userEmail/get-email.use-case";
import { GetAvailableLicensesUseCase } from "../use-cases/userEmail/get-available-licenses.usecase";
import { ResetPasswordUseCase } from "../use-cases/userEmail/reset-password.use-case";
import { DeleteUserEmailUseCase } from "../use-cases/userEmail/delete-user-email.use-case";
import { CreateWinleadUserUseCase } from "../use-cases/acces/winlead/create-winlead-user.use-case";
import { CreateAccesUseCase } from "../use-cases/acces/create-acces.use-case";
import { GetAccesPasswordUseCase } from "../use-cases/acces/get-acces-password.use-case";
import { ResetWinleadPasswordUseCase } from "../use-cases/acces/winlead/rest-winlead-password.use-case";
import { DeleteWinleadUserUseCase } from "../use-cases/acces/winlead/delete-winlead-user.use-case";
import { UpdateAccesUseCase } from "../use-cases/acces/update-acces.use-case";
import { DeleteAccesUseCase } from "../use-cases/acces/delete-acces.use-case";
import { ResetAccesPasswordUseCase } from "../use-cases/acces/reset-acces-password.use-case";

@Module({
  imports: [DatabaseModule],
  providers: [
    CreateUserEmailUseCase,
    GetUserEmailUseCase,
    GetAvailableLicensesUseCase,
    ResetPasswordUseCase,
    DeleteUserEmailUseCase,
    CreateWinleadUserUseCase,
    CreateAccesUseCase,
    GetAccesPasswordUseCase,
    ResetWinleadPasswordUseCase,
    DeleteWinleadUserUseCase,
    UpdateAccesUseCase,
    DeleteAccesUseCase,
    ResetAccesPasswordUseCase,
  ],
  exports: [
    CreateUserEmailUseCase,
    GetUserEmailUseCase,
    GetAvailableLicensesUseCase,
    ResetPasswordUseCase,
    DeleteUserEmailUseCase,
    CreateWinleadUserUseCase,
    CreateAccesUseCase,
    GetAccesPasswordUseCase,
    ResetWinleadPasswordUseCase,
    DeleteWinleadUserUseCase,
    UpdateAccesUseCase,
    DeleteAccesUseCase,
    ResetAccesPasswordUseCase,
  ],
})
export class AccesModule {}
