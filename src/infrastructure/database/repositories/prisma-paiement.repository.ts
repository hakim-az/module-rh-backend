import { Injectable } from "@nestjs/common";
import { PaiementRepository } from "../../../domain/repositories/paiement.repository";
import { Paiement } from "../../../domain/entities/paiement.entity";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class PrismaPaiementRepository implements PaiementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Paiement | null> {
    const paiement = await this.prisma.paiement.findUnique({
      where: { id },
    });

    return paiement ? new Paiement(paiement) : null;
  }

  async findByUserId(userId: number): Promise<Paiement | null> {
    const paiement = await this.prisma.paiement.findUnique({
      where: { idUser: userId },
    });

    return paiement ? new Paiement(paiement) : null;
  }

  async create(
    paiementData: Omit<Paiement, "id" | "createdAt" | "updatedAt">
  ): Promise<Paiement> {
    const paiement = await this.prisma.paiement.create({
      data: {
        ...paiementData,
        idUser: Number(paiementData.idUser),
      },
    });

    return new Paiement(paiement);
  }

  async update(
    id: number,
    paiementData: Partial<Paiement>
  ): Promise<Paiement | null> {
    try {
      const paiement = await this.prisma.paiement.update({
        where: { id },
        data: paiementData,
      });

      return new Paiement(paiement);
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.paiement.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
