import { Injectable, Inject } from "@nestjs/common";
import { RestauRepository } from "@domain/repositories/restau.repository";
import { Restau } from "@domain/entities/restau.entity";

@Injectable()
export class GetRestauUseCase {
  constructor(
    @Inject(RestauRepository)
    private readonly restauRepository: RestauRepository
  ) {}

  async execute(id: string): Promise<Restau | null> {
    return this.restauRepository.findById(id);
  }
}
