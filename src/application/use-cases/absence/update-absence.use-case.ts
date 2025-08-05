import { Injectable, Inject } from "@nestjs/common";
import { AbsenceRepository } from "@domain/repositories/absence.repository";
import { Absence } from "@domain/entities/absence.entity";
import { UpdateAbsenceDto } from "@application/dtos/absence.dto";

@Injectable()
export class UpdateAbsenceUseCase {
  constructor(
    @Inject(AbsenceRepository)
    private readonly absenceRepository: AbsenceRepository
  ) {}

  async execute(
    id: number,
    updateAbsenceDto: UpdateAbsenceDto
  ): Promise<Absence> {
    const existingAbsence = await this.absenceRepository.findById(id);
    if (!existingAbsence) {
      throw new Error("Absence not found");
    }

    const updateData: any = { ...updateAbsenceDto };

    // Convertir les dates si elles sont fournies
    if (updateAbsenceDto.dateDebut) {
      updateData.dateDebut = new Date(updateAbsenceDto.dateDebut);
    }
    if (updateAbsenceDto.dateFin) {
      updateData.dateFin = new Date(updateAbsenceDto.dateFin);
    }

    return this.absenceRepository.update(id, updateData);
  }
}
