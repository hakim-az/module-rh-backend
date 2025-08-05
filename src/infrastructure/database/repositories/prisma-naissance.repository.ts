import { Injectable } from "@nestjs/common";
import { NaissanceRepository } from "../../../domain/repositories/naissance.repository";
import { Naissance } from "../../../domain/entities/naissance.entity";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class PrismaNaissanceRepository implements NaissanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Naissance | null> {
    const naissance = await this.prisma.naissance.findUnique({
      where: { id },
    });

    return naissance ? new Naissance(naissance) : null;
  }

  async findByUserId(userId: number): Promise<Naissance | null> {
    const naissance = await this.prisma.naissance.findUnique({
      where: { idUser: userId },
    });

    return naissance ? new Naissance(naissance) : null;
  }

  async create(
    naissanceData: Omit<Naissance, "id" | "createdAt" | "updatedAt">
  ): Promise<Naissance> {
    const naissance = await this.prisma.naissance.create({
      data: {
        ...naissanceData,
        idUser: Number(naissanceData.idUser),
      },
    });

    return new Naissance(naissance);
  }

  async update(
    id: number,
    naissanceData: Partial<Naissance>
  ): Promise<Naissance | null> {
    try {
      const naissance = await this.prisma.naissance.update({
        where: { id },
        data: naissanceData,
      });

      return new Naissance(naissance);
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.naissance.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
