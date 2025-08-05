import { Contrat } from "../entities/contrat.entity";

export const ContratRepository = Symbol("ContratRepository");

export interface ContratRepository {
  findById(id: number): Promise<Contrat | null>;
  findByUserId(userId: number): Promise<Contrat[]>;
  findAll(): Promise<Contrat[]>;
  create(contrat: Contrat): Promise<Contrat>;
  update(id: number, contrat: Partial<Contrat>): Promise<Contrat>;
  delete(id: number): Promise<void>;
}
