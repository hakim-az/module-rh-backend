import { User } from "../entities/user.entity";

export const UserRepository = Symbol("UserRepository");

export interface UserRepository {
  findById(id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
  update(id: number, user: Partial<User>): Promise<User | null>;
  delete(id: number): Promise<boolean>;
  findByEmail(email: string): Promise<User | null>;
}
