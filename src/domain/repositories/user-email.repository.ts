import { UserEmail } from "../entities/user-email.entity";

export const UserEmailRepository = Symbol("UserEmailRepository");

export interface UserEmailRepository {
  findById(id: string): Promise<UserEmail | null>;
  findByUserId(userId: string): Promise<UserEmail | null>;
  findByUpn(upn: string): Promise<UserEmail | null>;
  save(userEmail: UserEmail): Promise<UserEmail>;
  delete(id: string): Promise<void>;
  updatePassword(id: string, encryptedPassword: string): Promise<void>;
}
