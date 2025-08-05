import { Injectable, Inject } from "@nestjs/common";
import { ContratRepository } from "@domain/repositories/contrat.repository";
import { Contrat } from "@domain/entities/contrat.entity";

@Injectable()
export class GetContratsByUserUseCase {
  constructor(
    @Inject(ContratRepository)
    private readonly contratRepository: ContratRepository
  ) {}

  async execute(userId: number): Promise<Contrat[]> {
    return this.contratRepository.findByUserId(userId);
  }
}
