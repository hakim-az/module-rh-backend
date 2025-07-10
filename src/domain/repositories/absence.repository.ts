import { Absence } from "../entities/absence.entity";

export const AbsenceRepository = Symbol("AbsenceRepository");

export interface AbsenceRepository {
  findById(id: string): Promise<Absence | null>;
  findByUserId(userId: string): Promise<Absence[]>;
  findAll(): Promise<Absence[]>;
  create(absence: Absence): Promise<Absence>;
  update(id: string, absence: Partial<Absence>): Promise<Absence>;
  delete(id: string): Promise<void>;
}
