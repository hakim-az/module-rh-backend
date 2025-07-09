import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/modules/database.module";
import { CreateUserUseCase } from "../use-cases/user/create-user.use-case";
import { GetUserUseCase } from "../use-cases/user/get-user.use-case";
import { GetAllUsersUseCase } from "../use-cases/user/get-all-users.use-case";
import { UpdateUserUseCase } from "../use-cases/user/update-user.use-case";
import { DeleteUserUseCase } from "../use-cases/user/delete-user.use-case";

@Module({
  imports: [DatabaseModule],
  providers: [
    CreateUserUseCase,
    GetUserUseCase,
    GetAllUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [
    CreateUserUseCase,
    GetUserUseCase,
    GetAllUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
})
export class UserModule {}
