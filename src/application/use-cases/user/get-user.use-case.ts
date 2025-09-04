import { Injectable, Inject } from "@nestjs/common";
import { UserRepository } from "@domain/repositories/user.repository";
import { User } from "@domain/entities/user.entity";

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async executeByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
}
