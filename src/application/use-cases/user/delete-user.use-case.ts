import { Injectable, Inject } from "@nestjs/common";
import { UserRepository } from "@domain/repositories/user.repository";

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    await this.userRepository.delete(id);
  }
}
