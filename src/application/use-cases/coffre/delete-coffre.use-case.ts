import { Injectable, Inject } from "@nestjs/common";
import { CoffreRepository } from "@domain/repositories/coffre.repository";

@Injectable()
export class DeleteCoffreUseCase {
  constructor(
    @Inject(CoffreRepository)
    private readonly coffreRepository: CoffreRepository
  ) {}

  async execute(id: number): Promise<void> {
    const existingAbsence = await this.coffreRepository.findById(id);
    if (!existingAbsence) {
      throw new Error("Coffre not found");
    }

    await this.coffreRepository.delete(id);
  }
}
