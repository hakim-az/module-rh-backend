import { Coffre } from "../entities/coffre.entity";

export const CoffreRepository = Symbol("CoffreRepository");

export interface CoffreRepository {
  findById(id: number): Promise<Coffre | null>;
  findByUserId(userId: number): Promise<Coffre[]>;
  findAll(): Promise<Coffre[]>;
  create(coffre: Coffre): Promise<Coffre>;
  update(id: number, coffre: Partial<Coffre>): Promise<Coffre>;
  delete(id: number): Promise<void>;
}
