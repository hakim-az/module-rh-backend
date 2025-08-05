import { Coffre } from "../entities/coffre.entity";

export const CoffreRepository = Symbol("CoffreRepository");

export interface CoffreRepository {
  findById(id: string): Promise<Coffre | null>;
  findByUserId(userId: string): Promise<Coffre[]>;
  findAll(): Promise<Coffre[]>;
  create(coffre: Coffre): Promise<Coffre>;
  update(id: string, coffre: Partial<Coffre>): Promise<Coffre>;
  delete(id: string): Promise<void>;
}
