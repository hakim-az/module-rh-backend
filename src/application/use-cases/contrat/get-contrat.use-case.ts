import { Injectable, Inject } from "@nestjs/common";
import { ContratRepository } from "@domain/repositories/contrat.repository";
import { Contrat } from "@domain/entities/contrat.entity";

@Injectable()
export class GetContratUseCase {
  constructor(
    @Inject(ContratRepository)
    private readonly contratRepository: ContratRepository
  ) {}

  async execute(id: string): Promise<Contrat | null> {
    return this.contratRepository.findById(id);
  }
}
