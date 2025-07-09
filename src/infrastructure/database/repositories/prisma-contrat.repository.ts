import { Injectable } from "@nestjs/common";
import { ContratRepository } from "../../../domain/repositories/contrat.repository";
import { Contrat } from "../../../domain/entities/contrat.entity";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class PrismaContratRepository implements ContratRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Contrat | null> {
    const contrat = await this.prisma.contrat.findUnique({
      where: { id },
    });

    return contrat ? new Contrat(contrat) : null;
  }

  async findByUserId(userId: string): Promise<Contrat | null> {
    const contrat = await this.prisma.contrat.findUnique({
      where: { idUser: userId },
    });

    return contrat ? new Contrat(contrat) : null;
  }

  // async create(
  //   contratData: Omit<Contrat, "id" | "createdAt" | "updatedAt">
  // ): Promise<Contrat> {
  //   const contrat = await this.prisma.contrat.create({
  //     data: contratData,
  //   });

  //   return new Contrat(contrat);
  // }

  async update(
    id: string,
    contratData: Partial<Contrat>
  ): Promise<Contrat | null> {
    try {
      const contrat = await this.prisma.contrat.update({
        where: { id },
        data: contratData,
      });

      return new Contrat(contrat);
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.contrat.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
