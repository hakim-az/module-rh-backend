import { Injectable, Inject } from "@nestjs/common";
import { CoffreRepository } from "@domain/repositories/coffre.repository";
import { Coffre } from "@domain/entities/coffre.entity";

@Injectable()
export class GetCoffreUseCase {
  constructor(
    @Inject(CoffreRepository)
    private readonly coffreRepository: CoffreRepository
  ) {}

  async execute(id: string): Promise<Coffre | null> {
    return this.coffreRepository.findById(id);
  }
}
