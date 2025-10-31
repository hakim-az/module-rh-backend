import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AccesRepository } from "@/domain/repositories/acces.repository";

@Injectable()
export class DeleteAccesUseCase {
  constructor(
    @Inject(AccesRepository)
    private readonly accesRepo: AccesRepository
  ) {}

  async execute(accesId: string): Promise<void> {
    const acces = await this.accesRepo.findById(accesId);

    if (!acces) {
      throw new NotFoundException("Acces not found");
    }

    await this.accesRepo.delete(accesId);
  }
}
