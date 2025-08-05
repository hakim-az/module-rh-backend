import { Justificatif } from "../entities/justificatif.entity";

export const JustificatifRepository = Symbol("JustificatifRepository");

export interface JustificatifRepository {
  findById(id: string): Promise<Justificatif | null>;
  findByUserId(userId: string): Promise<Justificatif | null>;
  create(
    justificatif: Omit<Justificatif, "id" | "createdAt" | "updatedAt">
  ): Promise<Justificatif>;
  update(
    id: string,
    justificatif: Partial<Justificatif>
  ): Promise<Justificatif | null>;
  delete(id: string): Promise<boolean>;
}
