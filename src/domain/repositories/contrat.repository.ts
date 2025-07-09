import { Contrat } from "../entities/contrat.entity";

export const ContratRepository = Symbol("ContratRepository");

export interface ContratRepository {
  findById(id: string): Promise<Contrat | null>;
  findByUserId(userId: string): Promise<Contrat[]>;
  findAll(): Promise<Contrat[]>;
  create(contrat: Contrat): Promise<Contrat>;
  update(id: string, contrat: Partial<Contrat>): Promise<Contrat>;
  delete(id: string): Promise<void>;
}
