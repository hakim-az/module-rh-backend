import { Injectable, Inject } from "@nestjs/common";
import { AbsenceRepository } from "@domain/repositories/absence.repository";
import { Absence } from "@domain/entities/absence.entity";

@Injectable()
export class GetAbsenceUseCase {
  constructor(
    @Inject(AbsenceRepository)
    private readonly absenceRepository: AbsenceRepository
  ) {}

  async execute(id: number): Promise<Absence | null> {
    return this.absenceRepository.findById(id);
  }
}
