import { Adresse } from "../entities/adresse.entity";

export const AdresseRepository = Symbol("AdresseRepository");

export interface AdresseRepository {
  findById(id: number): Promise<Adresse | null>;
  findByUserId(userId: number): Promise<Adresse | null>;
  create(
    adresse: Omit<Adresse, "id" | "createdAt" | "updatedAt">
  ): Promise<Adresse>;
  update(id: number, adresse: Partial<Adresse>): Promise<Adresse | null>;
  delete(id: number): Promise<boolean>;
}
