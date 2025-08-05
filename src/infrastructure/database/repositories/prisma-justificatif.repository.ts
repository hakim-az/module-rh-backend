import { Injectable } from "@nestjs/common";
import { JustificatifRepository } from "../../../domain/repositories/justificatif.repository";
import { Justificatif } from "../../../domain/entities/justificatif.entity";
import { PrismaService } from "../../database/prisma.service";
import { generateUniqueNumericId } from "@/domain/services/generate-id.service";

@Injectable()
export class PrismaJustificatifRepository implements JustificatifRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Justificatif | null> {
    const justificatif = await this.prisma.justificatif.findUnique({
      where: { id },
    });

    return justificatif ? new Justificatif(justificatif) : null;
  }

  async findByUserId(userId: string): Promise<Justificatif | null> {
    const justificatif = await this.prisma.justificatif.findUnique({
      where: { idUser: userId },
    });

    return justificatif ? new Justificatif(justificatif) : null;
  }

  async create(
    justificatifData: Omit<Justificatif, "id" | "createdAt" | "updatedAt">
  ): Promise<Justificatif> {
    const id = await generateUniqueNumericId("justificatif");
    const justificatif = await this.prisma.justificatif.create({
      data: {
        id: id,
        ...justificatifData,
      },
    });

    return new Justificatif(justificatif);
  }

  async update(
    id: string,
    justificatifData: Partial<Justificatif>
  ): Promise<Justificatif | null> {
    try {
      const justificatif = await this.prisma.justificatif.update({
        where: { id },
        data: justificatifData,
      });

      return new Justificatif(justificatif);
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.justificatif.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
