import { Module } from "@nestjs/common";
import { DatabaseModule } from "@infrastructure/modules/database.module";
import { CreateCoffreUseCase } from "../use-cases/coffre/create-coffre.use-case";
import { GetCoffreUseCase } from "../use-cases/coffre/get-coffre.use-case";
import { GetAllCoffresUseCase } from "../use-cases/coffre/get-all-coffres.use-case";
import { GetCoffresByUserUseCase } from "../use-cases/coffre/get-coffres-by-user.use-case";
import { UpdateCoffreUseCase } from "../use-cases/coffre/update-coffre.use-case";
import { DeleteCoffreUseCase } from "../use-cases/coffre/delete-coffre.use-case";

@Module({
  imports: [DatabaseModule],
  providers: [
    CreateCoffreUseCase,
    GetCoffreUseCase,
    GetAllCoffresUseCase,
    GetCoffresByUserUseCase,
    UpdateCoffreUseCase,
    DeleteCoffreUseCase,
  ],
  exports: [
    CreateCoffreUseCase,
    GetCoffreUseCase,
    GetAllCoffresUseCase,
    GetCoffresByUserUseCase,
    UpdateCoffreUseCase,
    DeleteCoffreUseCase,
  ],
})
export class CoffreModule {}
