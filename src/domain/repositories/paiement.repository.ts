import { Paiement } from "../entities/paiement.entity";

export const PaiementRepository = Symbol("PaiementRepository");

export interface PaiementRepository {
  findById(id: number): Promise<Paiement | null>;
  findByUserId(userId: number): Promise<Paiement | null>;
  create(
    paiement: Omit<Paiement, "id" | "createdAt" | "updatedAt">
  ): Promise<Paiement>;
  update(id: number, paiement: Partial<Paiement>): Promise<Paiement | null>;
  delete(id: number): Promise<boolean>;
}
