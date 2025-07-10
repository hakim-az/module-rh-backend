import { Injectable, Inject } from "@nestjs/common";
import { CoffreRepository } from "@domain/repositories/coffre.repository";
import { Coffre } from "@domain/entities/coffre.entity";
import { UpdateCoffreDto } from "@/application/dtos/coffre.dto";

@Injectable()
export class UpdateCoffreUseCase {
  constructor(
    @Inject(CoffreRepository)
    private readonly coffreRepository: CoffreRepository
  ) {}

  async execute(id: string, updateCoffreDto: UpdateCoffreDto): Promise<Coffre> {
    const existingCoffre = await this.coffreRepository.findById(id);
    if (!existingCoffre) {
      throw new Error("Coffre not found");
    }

    const updateData: any = { ...updateCoffreDto };

    return this.coffreRepository.update(id, updateData);
  }
}
