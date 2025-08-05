import { Injectable, Inject } from "@nestjs/common";
import { RestauRepository } from "@domain/repositories/restau.repository";

@Injectable()
export class DeleteRestauUseCase {
  constructor(
    @Inject(RestauRepository)
    private readonly restauRepository: RestauRepository
  ) {}

  async execute(id: string): Promise<void> {
    const existingRestau = await this.restauRepository.findById(id);
    if (!existingRestau) {
      throw new Error("Restau not found");
    }

    await this.restauRepository.delete(id);
  }
}
