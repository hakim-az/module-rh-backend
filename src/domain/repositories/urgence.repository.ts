import { Urgence } from "../entities/urgence.entity";

export const UrgenceRepository = Symbol("UrgenceRepository");

export interface UrgenceRepository {
  findById(id: number): Promise<Urgence | null>;
  findByUserId(userId: number): Promise<Urgence | null>;
  create(
    urgence: Omit<Urgence, "id" | "createdAt" | "updatedAt">
  ): Promise<Urgence>;
  update(id: number, urgence: Partial<Urgence>): Promise<Urgence | null>;
  delete(id: number): Promise<boolean>;
}
