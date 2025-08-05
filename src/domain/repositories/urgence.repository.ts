import { Urgence } from "../entities/urgence.entity";

export const UrgenceRepository = Symbol("UrgenceRepository");

export interface UrgenceRepository {
  findById(id: string): Promise<Urgence | null>;
  findByUserId(userId: string): Promise<Urgence | null>;
  create(
    urgence: Omit<Urgence, "id" | "createdAt" | "updatedAt">
  ): Promise<Urgence>;
  update(id: string, urgence: Partial<Urgence>): Promise<Urgence | null>;
  delete(id: string): Promise<boolean>;
}
