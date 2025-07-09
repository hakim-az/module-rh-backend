import { Injectable } from "@nestjs/common";
import { AdresseRepository } from "../../../domain/repositories/adresse.repository";
import { Adresse } from "../../../domain/entities/adresse.entity";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class PrismaAdresseRepository implements AdresseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Adresse | null> {
    const adresse = await this.prisma.adresse.findUnique({
      where: { id },
    });

    return adresse ? new Adresse(adresse) : null;
  }

  async findByUserId(userId: string): Promise<Adresse | null> {
    const adresse = await this.prisma.adresse.findUnique({
      where: { idUser: userId },
    });

    return adresse ? new Adresse(adresse) : null;
  }

  async create(
    adresseData: Omit<Adresse, "id" | "createdAt" | "updatedAt">
  ): Promise<Adresse> {
    const adresse = await this.prisma.adresse.create({
      data: adresseData,
    });

    return new Adresse(adresse);
  }

  async update(
    id: string,
    adresseData: Partial<Adresse>
  ): Promise<Adresse | null> {
    try {
      const adresse = await this.prisma.adresse.update({
        where: { id },
        data: adresseData,
      });

      return new Adresse(adresse);
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.adresse.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
