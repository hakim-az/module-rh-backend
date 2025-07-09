import { Injectable, Inject } from "@nestjs/common";
import { ContratRepository } from "@domain/repositories/contrat.repository";
import { Contrat } from "@domain/entities/contrat.entity";
import { UpdateContratDto } from "@application/dtos/contrat.dto";

@Injectable()
export class UpdateContratUseCase {
  constructor(
    @Inject(ContratRepository)
    private readonly contratRepository: ContratRepository
  ) {}

  async execute(
    id: string,
    updateContratDto: UpdateContratDto
  ): Promise<Contrat> {
    const existingContrat = await this.contratRepository.findById(id);
    if (!existingContrat) {
      throw new Error("Contract not found");
    }

    const updateData: any = { ...updateContratDto };

    // Convertir les dates si elles sont fournies
    if (updateContratDto.dateDebut) {
      updateData.dateDebut = new Date(updateContratDto.dateDebut);
    }
    if (updateContratDto.dateFin) {
      updateData.dateFin = new Date(updateContratDto.dateFin);
    }

    return this.contratRepository.update(id, updateData);
  }
}
