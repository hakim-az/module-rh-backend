import { Naissance } from "../entities/naissance.entity";

export const NaissanceRepository = Symbol("NaissanceRepository");

export interface NaissanceRepository {
  findById(id: number): Promise<Naissance | null>;
  findByUserId(userId: number): Promise<Naissance | null>;
  create(
    naissance: Omit<Naissance, "id" | "createdAt" | "updatedAt">
  ): Promise<Naissance>;
  update(id: number, naissance: Partial<Naissance>): Promise<Naissance | null>;
  delete(id: number): Promise<boolean>;
}
