import { Injectable } from "@nestjs/common";
import * as urgenceRepository from "../../../domain/repositories/urgence.repository";
import { Urgence } from "../../../domain/entities/urgence.entity";
import { PrismaService } from "../../database/prisma.service";
import { generateUniqueNumericId } from "@/domain/services/generateUniqueNumericId";

@Injectable()
export class PrismaUrgenceRepository
  implements urgenceRepository.UrgenceRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Urgence | null> {
    const urgence = await this.prisma.urgence.findUnique({
      where: { id },
    });

    return urgence ? new Urgence(urgence) : null;
  }

  async findByUserId(userId: string): Promise<Urgence | null> {
    const urgence = await this.prisma.urgence.findUnique({
      where: { idUser: userId },
    });

    return urgence ? new Urgence(urgence) : null;
  }

  async create(
    urgenceData: Omit<Urgence, "id" | "createdAt" | "updatedAt">
  ): Promise<Urgence> {
    const id = await generateUniqueNumericId("urgence");
    const urgence = await this.prisma.urgence.create({
      data: {
        id: id,
        ...urgenceData,
      },
    });

    return new Urgence(urgence);
  }

  async update(
    id: string,
    urgenceData: Partial<Urgence>
  ): Promise<Urgence | null> {
    try {
      const urgence = await this.prisma.urgence.update({
        where: { id },
        data: urgenceData,
      });

      return new Urgence(urgence);
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.urgence.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
