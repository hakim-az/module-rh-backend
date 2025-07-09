import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { User } from "../../../domain/entities/user.entity";
import { UpdateUserDto } from "../../dtos/user.dto";

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<User | null> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error("Utilisateur non trouvé");
    }

    return this.userRepository.update(id, updateUserDto);
  }
}
