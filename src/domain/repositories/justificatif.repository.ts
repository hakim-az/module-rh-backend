import { Justificatif } from "../entities/justificatif.entity";

export const JustificatifRepository = Symbol("JustificatifRepository");

export interface JustificatifRepository {
  findById(id: number): Promise<Justificatif | null>;
  findByUserId(userId: number): Promise<Justificatif | null>;
  create(
    justificatif: Omit<Justificatif, "id" | "createdAt" | "updatedAt">
  ): Promise<Justificatif>;
  update(
    id: number,
    justificatif: Partial<Justificatif>
  ): Promise<Justificatif | null>;
  delete(id: number): Promise<boolean>;
}
