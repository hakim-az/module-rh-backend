import { Module } from "@nestjs/common";
import { DatabaseModule } from "@infrastructure/modules/database.module";
import { CreateContratUseCase } from "../use-cases/contrat/create-contrat.use-case";
import { GetContratUseCase } from "../use-cases/contrat/get-contrat.use-case";
import { GetAllContratsUseCase } from "../use-cases/contrat/get-all-contrats.use-case";
import { GetContratsByUserUseCase } from "../use-cases/contrat/get-contrats-by-user.use-case";
import { UpdateContratUseCase } from "../use-cases/contrat/update-contrat.use-case";
import { DeleteContratUseCase } from "../use-cases/contrat/delete-contrat.use-case";
import { UploadSignedContractUseCase } from "../use-cases/contrat/upload-signed-contract.use-case";

@Module({
  imports: [DatabaseModule],
  providers: [
    CreateContratUseCase,
    GetContratUseCase,
    GetAllContratsUseCase,
    GetContratsByUserUseCase,
    UpdateContratUseCase,
    DeleteContratUseCase,
    UploadSignedContractUseCase,
  ],
  exports: [
    CreateContratUseCase,
    GetContratUseCase,
    GetAllContratsUseCase,
    GetContratsByUserUseCase,
    UpdateContratUseCase,
    DeleteContratUseCase,
    UploadSignedContractUseCase,
  ],
})
export class ContratModule {}
