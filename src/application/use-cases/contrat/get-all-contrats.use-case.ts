import { Injectable, Inject } from "@nestjs/common";
import { ContratRepository } from "@domain/repositories/contrat.repository";
import { Contrat } from "@domain/entities/contrat.entity";

@Injectable()
export class GetAllContratsUseCase {
  constructor(
    @Inject(ContratRepository)
    private readonly contratRepository: ContratRepository
  ) {}

  async execute(): Promise<Contrat[]> {
    return this.contratRepository.findAll();
  }
}
