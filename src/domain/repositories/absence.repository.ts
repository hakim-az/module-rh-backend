import { Absence } from "../entities/absence.entity";

export const AbsenceRepository = Symbol("AbsenceRepository");

export interface AbsenceRepository {
  findById(id: number): Promise<Absence | null>;
  findByUserId(userId: number): Promise<Absence[]>;
  findAll(): Promise<Absence[]>;
  create(absence: Absence): Promise<Absence>;
  update(id: number, absence: Partial<Absence>): Promise<Absence>;
  delete(id: number): Promise<void>;
}
