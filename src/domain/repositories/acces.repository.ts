import { Acces } from "@/domain/entities/acces.entity";

// ✅ Symbol for dependency injection
export const AccesRepository = Symbol("AccesRepository");

// ✅ Repository interface
export interface AccesRepository {
  create(acces: Acces): Promise<Acces>;
  save(acces: Acces): Promise<Acces>;
  findById(id: string): Promise<Acces | null>;
  findByAccesId(accesId: string): Promise<Acces | null>;
  update(id: string, acces: Acces): Promise<Acces>;
  findByUserIdAndProductCode(
    userId: string,
    productCode: string
  ): Promise<Acces | null>;
  delete(id: string): Promise<void>;
}
