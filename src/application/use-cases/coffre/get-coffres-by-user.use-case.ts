import { Injectable, Inject } from "@nestjs/common";
import { CoffreRepository } from "@domain/repositories/coffre.repository";
import { Coffre } from "@domain/entities/coffre.entity";

@Injectable()
export class GetCoffresByUserUseCase {
  constructor(
    @Inject(CoffreRepository)
    private readonly coffreRepository: CoffreRepository
  ) {}

  async execute(userId: string): Promise<Coffre[]> {
    return this.coffreRepository.findByUserId(userId);
  }
}
