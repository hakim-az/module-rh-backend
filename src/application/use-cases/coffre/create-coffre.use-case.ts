import { Injectable, Inject } from "@nestjs/common";
import { CoffreRepository } from "@domain/repositories/coffre.repository";
import { UserRepository } from "@domain/repositories/user.repository";
import { Coffre } from "@domain/entities/coffre.entity";
import { CreateCoffreDto } from "@/application/dtos/coffre.dto";

@Injectable()
export class CreateCoffreUseCase {
  constructor(
    @Inject(CoffreRepository)
    private readonly coffreRepository: CoffreRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(createCoffreDto: CreateCoffreDto): Promise<Coffre> {
    // Vérifier si l'utilisateur existe
    const user = await this.userRepository.findById(createCoffreDto.idUser);
    if (!user) {
      throw new Error("Coffre not found");
    }

    // Créer le coffre
    const coffre = Coffre.create(
      createCoffreDto.idUser,
      createCoffreDto.typeBulletin,
      createCoffreDto.mois,
      createCoffreDto.annee,
      createCoffreDto.note,
      createCoffreDto.fichierJustificatifPdf
    );

    return this.coffreRepository.create(coffre);
  }
}
