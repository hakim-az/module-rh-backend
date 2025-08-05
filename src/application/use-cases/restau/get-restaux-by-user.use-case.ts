import { Injectable, Inject } from "@nestjs/common";
import { RestauRepository } from "@domain/repositories/restau.repository";
import { Restau } from "@domain/entities/restau.entity";

@Injectable()
export class GetRestauxByUserUseCase {
  constructor(
    @Inject(RestauRepository)
    private readonly restauRepository: RestauRepository
  ) {}

  async execute(userId: number): Promise<Restau[]> {
    return this.restauRepository.findByUserId(userId);
  }
}
