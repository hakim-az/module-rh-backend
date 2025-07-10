import { Injectable, Inject } from "@nestjs/common";
import { RestauRepository } from "@domain/repositories/restau.repository";
import { Restau } from "@domain/entities/restau.entity";
import { UpdateRestauDto } from "@/application/dtos/restau.dto";

@Injectable()
export class UpdateRestauUseCase {
  constructor(
    @Inject(RestauRepository)
    private readonly restauRepository: RestauRepository
  ) {}

  async execute(id: string, updateRestauDto: UpdateRestauDto): Promise<Restau> {
    const existingRestau = await this.restauRepository.findById(id);
    if (!existingRestau) {
      throw new Error("Coffre not found");
    }

    const updateData: any = { ...updateRestauDto };

    return this.restauRepository.update(id, updateData);
  }
}
