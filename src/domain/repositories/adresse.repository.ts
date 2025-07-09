import { Adresse } from "../entities/adresse.entity";

export const AdresseRepository = Symbol("AdresseRepository");

export interface AdresseRepository {
  findById(id: string): Promise<Adresse | null>;
  findByUserId(userId: string): Promise<Adresse | null>;
  create(
    adresse: Omit<Adresse, "id" | "createdAt" | "updatedAt">
  ): Promise<Adresse>;
  update(id: string, adresse: Partial<Adresse>): Promise<Adresse | null>;
  delete(id: string): Promise<boolean>;
}
