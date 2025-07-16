import { Injectable, Inject } from "@nestjs/common";
import { ContratRepository } from "@domain/repositories/contrat.repository";
import { UserRepository } from "@domain/repositories/user.repository";
import { Contrat } from "@domain/entities/contrat.entity";
import { CreateContratDto } from "@application/dtos/contrat.dto";

@Injectable()
export class CreateContratUseCase {
  constructor(
    @Inject(ContratRepository)
    private readonly contratRepository: ContratRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(createContratDto: CreateContratDto): Promise<Contrat> {
    // Vérifier si l'utilisateur existe
    const user = await this.userRepository.findById(createContratDto.idUser);
    if (!user) {
      throw new Error("User not found");
    }

    // Créer le contrat
    const contrat = Contrat.create(
      createContratDto.idUser,
      createContratDto.poste,
      createContratDto.typeContrat,
      new Date(createContratDto.dateDebut),
      new Date(createContratDto.dateFin),
      createContratDto.etablissementDeSante,
      createContratDto.serviceDeSante,
      createContratDto.salaire,
      createContratDto.matricule,
      createContratDto.fichierContratSignerPdf,
      createContratDto.fichierContratSignerPdf
    );

    return this.contratRepository.create(contrat);
  }
}
