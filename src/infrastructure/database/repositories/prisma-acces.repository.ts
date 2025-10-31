import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { AccesRepository } from "@/domain/repositories/acces.repository";
import { Acces } from "@/domain/entities/acces.entity";

@Injectable()
export class PrismaAccesRepository implements AccesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapPrismaToEntity(result: any): Acces {
    return new Acces(
      result.id,
      result.userId,
      result.status,
      result.productCode,
      result.password,
      result.email,
      result.createdAt,
      result.updatedAt
    );
  }

  async create(acces: Acces): Promise<Acces> {
    const result = await this.prisma.acces.create({
      data: {
        id: acces.id,
        userId: acces.userId,
        status: acces.status,
        productCode: acces.productCode,
        password: acces.password ?? null, // ✅ optional field
        email: acces.email ?? null, // ✅ optional field
      },
    });

    return this.mapPrismaToEntity(result);
  }

  async save(acces: Acces): Promise<Acces> {
    const data = {
      ...acces,
      createdAt: acces.createdAt || undefined,
      updatedAt: new Date(),
    };
    const record = await this.prisma.acces.upsert({
      where: { id: acces.id },
      update: data,
      create: data,
    });
    return this.mapPrismaToEntity(record);
  }

  async update(id: string, acces: Acces): Promise<Acces> {
    // Build a partial data object dynamically
    const data: Partial<any> = {
      updatedAt: new Date(),
    };

    if (acces.userId !== undefined) data.userId = acces.userId;
    if (acces.status !== undefined) data.status = acces.status;
    if (acces.productCode !== undefined) data.productCode = acces.productCode;
    if (acces.password !== undefined) data.password = acces.password ?? null;
    if (acces.email !== undefined) data.email = acces.email ?? null;

    const record = await this.prisma.acces.update({
      where: { id },
      data,
    });

    return this.mapPrismaToEntity(record);
  }

  /** ✅ Match interface: returns Acces | null (not raw Prisma) */
  async findById(id: string): Promise<Acces | null> {
    // Use findUnique only if `id` is @id or @unique in your Prisma schema
    const row = await this.prisma.acces.findUnique({
      where: { id },
      // include relations only if your entity needs them later;
      // they won’t be used in the mapper unless you extend it.
      include: {
        user: true,
      },
    });
    return row ? this.mapPrismaToEntity(row) : null;
  }

  async findByAccesId(accesId: string): Promise<Acces | null> {
    const result = await this.prisma.acces.findUnique({
      where: { id: accesId },
    });

    return result ? this.mapPrismaToEntity(result) : null;
  }

  async findByUserIdAndProductCode(
    userId: string,
    productCode: string
  ): Promise<Acces | null> {
    const result = await this.prisma.acces.findFirst({
      where: { userId, productCode },
    });
    return result ? this.mapPrismaToEntity(result) : null;
  }

  // and a simple delete by id:
  async delete(id: string) {
    await this.prisma.acces.delete({ where: { id } });
  }
}
