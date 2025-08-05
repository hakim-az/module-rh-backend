import { Paiement } from "../entities/paiement.entity";

export const PaiementRepository = Symbol("PaiementRepository");

export interface PaiementRepository {
  findById(id: string): Promise<Paiement | null>;
  findByUserId(userId: string): Promise<Paiement | null>;
  create(
    paiement: Omit<Paiement, "id" | "createdAt" | "updatedAt">
  ): Promise<Paiement>;
  update(id: string, paiement: Partial<Paiement>): Promise<Paiement | null>;
  delete(id: string): Promise<boolean>;
}
