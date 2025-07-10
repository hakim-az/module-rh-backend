import { Injectable, Inject } from "@nestjs/common";
import { AbsenceRepository } from "@domain/repositories/absence.repository";
import { Absence } from "@domain/entities/absence.entity";

@Injectable()
export class GetAllAbsencesUseCase {
  constructor(
    @Inject(AbsenceRepository)
    private readonly absenceRepository: AbsenceRepository
  ) {}

  async execute(): Promise<Absence[]> {
    return this.absenceRepository.findAll();
  }
}
