import { Restau } from "../entities/restau.entity";

export const RestauRepository = Symbol("RestauRepository");

export interface RestauRepository {
  findById(id: string): Promise<Restau | null>;
  findByUserId(userId: string): Promise<Restau[]>;
  findAll(): Promise<Restau[]>;
  create(restau: Restau): Promise<Restau>;
  update(id: string, restau: Partial<Restau>): Promise<Restau>;
  delete(id: string): Promise<void>;
}
