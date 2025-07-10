import { Injectable, Inject } from "@nestjs/common";
import { RestauRepository } from "@domain/repositories/restau.repository";
import { Restau } from "@domain/entities/restau.entity";

@Injectable()
export class GetAllRestauxUseCase {
  constructor(
    @Inject(RestauRepository)
    private readonly restauRepository: RestauRepository
  ) {}

  async execute(): Promise<Restau[]> {
    return this.restauRepository.findAll();
  }
}
