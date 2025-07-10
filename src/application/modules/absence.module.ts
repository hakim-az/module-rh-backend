import { Module } from "@nestjs/common";
import { DatabaseModule } from "@infrastructure/modules/database.module";
import { CreateAbsenceUseCase } from "../use-cases/absence/create-absence.use-case";
import { GetAbsenceUseCase } from "../use-cases/absence/get-absence.use-case";
import { GetAllAbsencesUseCase } from "../use-cases/absence/get-all-absences.use-case";
import { GetAbsencesByUserUseCase } from "../use-cases/absence/get-absences-by-user.use-case";
import { UpdateAbsenceUseCase } from "../use-cases/absence/update-absence.use-case";
import { DeleteAbsenceUseCase } from "../use-cases/absence/delete-absence.use-case";

@Module({
  imports: [DatabaseModule],
  providers: [
    CreateAbsenceUseCase,
    GetAbsenceUseCase,
    GetAllAbsencesUseCase,
    GetAbsencesByUserUseCase,
    UpdateAbsenceUseCase,
    DeleteAbsenceUseCase,
  ],
  exports: [
    CreateAbsenceUseCase,
    GetAbsenceUseCase,
    GetAllAbsencesUseCase,
    GetAbsencesByUserUseCase,
    UpdateAbsenceUseCase,
    DeleteAbsenceUseCase,
  ],
})
export class AbsenceModule {}
