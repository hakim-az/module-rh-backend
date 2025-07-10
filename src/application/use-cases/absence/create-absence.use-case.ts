import { Injectable, Inject } from "@nestjs/common";
import { AbsenceRepository } from "@domain/repositories/absence.repository";
import { UserRepository } from "@domain/repositories/user.repository";
import { Absence } from "@domain/entities/absence.entity";
import { CreateAbsenceDto } from "@application/dtos/absence.dto";

@Injectable()
export class CreateAbsenceUseCase {
  constructor(
    @Inject(AbsenceRepository)
    private readonly absenceRepository: AbsenceRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(createAbsenceDto: CreateAbsenceDto): Promise<Absence> {
    // Vérifier si l'utilisateur existe
    const user = await this.userRepository.findById(createAbsenceDto.idUser);
    if (!user) {
      throw new Error("User not found");
    }

    // Créer le contrat
    const absence = Absence.create(
      createAbsenceDto.idUser,
      createAbsenceDto.typeAbsence,
      new Date(createAbsenceDto.dateDebut),
      new Date(createAbsenceDto.dateFin),
      createAbsenceDto.note,
      createAbsenceDto.statut,
      createAbsenceDto.motifDeRefus,
      createAbsenceDto.fichierJustificatifPdf
    );

    return this.absenceRepository.create(absence);
  }
}
