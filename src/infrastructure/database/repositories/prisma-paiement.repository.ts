import { Injectable } from "@nestjs/common";
import { PaiementRepository } from "../../../domain/repositories/paiement.repository";
import { Paiement } from "../../../domain/entities/paiement.entity";
import { PrismaService } from "../../database/prisma.service";
import { generateUniqueNumericId } from "@/domain/services/generateUniqueNumericId";

@Injectable()
export class PrismaPaiementRepository implements PaiementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Paiement | null> {
    const paiement = await this.prisma.paiement.findUnique({
      where: { id },
    });

    return paiement ? new Paiement(paiement) : null;
  }

  async findByUserId(userId: string): Promise<Paiement | null> {
    const paiement = await this.prisma.paiement.findUnique({
      where: { idUser: userId },
    });

    return paiement ? new Paiement(paiement) : null;
  }

  async create(
    paiementData: Omit<Paiement, "id" | "createdAt" | "updatedAt">
  ): Promise<Paiement> {
    const id = await generateUniqueNumericId("paiement");
    const paiement = await this.prisma.paiement.create({
      data: {
        id: id,
        ...paiementData,
      },
    });

    return new Paiement(paiement);
  }

  async update(
    id: string,
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

  async delete(id: string): Promise<boolean> {
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
