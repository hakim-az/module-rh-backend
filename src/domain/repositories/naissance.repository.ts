import { Naissance } from "../entities/naissance.entity";

export const NaissanceRepository = Symbol("NaissanceRepository");

export interface NaissanceRepository {
  findById(id: string): Promise<Naissance | null>;
  findByUserId(userId: string): Promise<Naissance | null>;
  create(
    naissance: Omit<Naissance, "id" | "createdAt" | "updatedAt">
  ): Promise<Naissance>;
  update(id: string, naissance: Partial<Naissance>): Promise<Naissance | null>;
  delete(id: string): Promise<boolean>;
}
