import { Restau } from "../entities/restau.entity";

export const RestauRepository = Symbol("RestauRepository");

export interface RestauRepository {
  findById(id: number): Promise<Restau | null>;
  findByUserId(userId: number): Promise<Restau[]>;
  findAll(): Promise<Restau[]>;
  create(restau: Restau): Promise<Restau>;
  update(id: number, restau: Partial<Restau>): Promise<Restau>;
  delete(id: number): Promise<void>;
}
