import { Injectable } from "@nestjs/common";
import { JustificatifRepository } from "../../../domain/repositories/justificatif.repository";
import { Justificatif } from "../../../domain/entities/justificatif.entity";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class PrismaJustificatifRepository implements JustificatifRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Justificatif | null> {
    const justificatif = await this.prisma.justificatif.findUnique({
      where: { id },
    });

    return justificatif ? new Justificatif(justificatif) : null;
  }

  async findByUserId(userId: number): Promise<Justificatif | null> {
    const justificatif = await this.prisma.justificatif.findUnique({
      where: { idUser: userId },
    });

    return justificatif ? new Justificatif(justificatif) : null;
  }

  async create(
    justificatifData: Omit<Justificatif, "id" | "createdAt" | "updatedAt">
  ): Promise<Justificatif> {
    const justificatif = await this.prisma.justificatif.create({
      data: {
        ...justificatifData,
        idUser: Number(justificatifData.idUser),
      },
    });

    return new Justificatif(justificatif);
  }

  async update(
    id: number,
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

  async delete(id: number): Promise<boolean> {
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
