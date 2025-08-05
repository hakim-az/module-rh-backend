import { Injectable, Inject } from "@nestjs/common";
import { ContratRepository } from "@domain/repositories/contrat.repository";

@Injectable()
export class DeleteContratUseCase {
  constructor(
    @Inject(ContratRepository)
    private readonly contratRepository: ContratRepository
  ) {}

  async execute(id: number): Promise<void> {
    const existingContrat = await this.contratRepository.findById(id);
    if (!existingContrat) {
      throw new Error("Contract not found");
    }

    await this.contratRepository.delete(id);
  }
}
