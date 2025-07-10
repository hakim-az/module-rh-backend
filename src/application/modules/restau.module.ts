import { Module } from "@nestjs/common";
import { DatabaseModule } from "@infrastructure/modules/database.module";
import { CreateRestauUseCase } from "../use-cases/restau/create-restau.use-case";
import { GetRestauUseCase } from "../use-cases/restau/get-restau.use-case";
import { GetAllRestauxUseCase } from "../use-cases/restau/get-all-restaux.use-case";
import { GetRestauxByUserUseCase } from "../use-cases/restau/get-restaux-by-user.use-case";
import { UpdateRestauUseCase } from "../use-cases/restau/update-restau.use-case";
import { DeleteRestauUseCase } from "../use-cases/restau/delete-restau.use-case";

@Module({
  imports: [DatabaseModule],
  providers: [
    CreateRestauUseCase,
    GetRestauUseCase,
    GetAllRestauxUseCase,
    GetRestauxByUserUseCase,
    UpdateRestauUseCase,
    DeleteRestauUseCase,
  ],
  exports: [
    CreateRestauUseCase,
    GetRestauUseCase,
    GetAllRestauxUseCase,
    GetRestauxByUserUseCase,
    UpdateRestauUseCase,
    DeleteRestauUseCase,
  ],
})
export class RestauModule {}
