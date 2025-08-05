import { Injectable, Inject } from "@nestjs/common";
import { AbsenceRepository } from "@domain/repositories/absence.repository";

@Injectable()
export class DeleteAbsenceUseCase {
  constructor(
    @Inject(AbsenceRepository)
    private readonly absenceRepository: AbsenceRepository
  ) {}

  async execute(id: number): Promise<void> {
    const existingAbsence = await this.absenceRepository.findById(id);
    if (!existingAbsence) {
      throw new Error("Absence not found");
    }

    await this.absenceRepository.delete(id);
  }
}
