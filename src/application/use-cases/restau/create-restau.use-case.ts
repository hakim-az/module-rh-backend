import { Injectable, Inject } from "@nestjs/common";
import { RestauRepository } from "@domain/repositories/restau.repository";
import { UserRepository } from "@domain/repositories/user.repository";
import { Restau } from "@domain/entities/restau.entity";
import { CreateRestauDto } from "@/application/dtos/restau.dto";

@Injectable()
export class CreateRestauUseCase {
  constructor(
    @Inject(RestauRepository)
    private readonly restauRepository: RestauRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(createRestauDto: CreateRestauDto): Promise<Restau> {
    // Vérifier si l'utilisateur existe
    const user = await this.userRepository.findById(createRestauDto.idUser);
    if (!user) {
      throw new Error("Restau not found");
    }

    // Créer le restau
    const restau = Restau.create(
      createRestauDto.idUser,
      createRestauDto.nbrJours,
      createRestauDto.mois,
      createRestauDto.annee,
      createRestauDto.note,
      createRestauDto.fichierJustificatifPdf
    );

    return this.restauRepository.create(restau);
  }
}
