import { Module } from "@nestjs/common";
import { DatabaseModule } from "@/infrastructure/modules/database.module";
import { CreateAccesUseCase } from "../use-cases/acces/create-acces.use-case";

@Module({
  imports: [DatabaseModule],
  providers: [CreateAccesUseCase],
  exports: [CreateAccesUseCase],
})
export class UserEmailModule {}
