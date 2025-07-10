import { Injectable } from "@nestjs/common";
import { CoffreRepository } from "@domain/repositories/coffre.repository";
import { Coffre } from "@domain/entities/coffre.entity";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PrismaCoffreRepository implements CoffreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Coffre | null> {
    const coffre = await this.prisma.coffre.findUnique({
      where: { id },
    });

    if (!coffre) return null;

    return new Coffre(
      coffre.id,
      coffre.idUser,
      coffre.typeBulletin,
      coffre.mois,
      coffre.annee,
      coffre.note,
      coffre.fichierJustificatifPdf,
      coffre.createdAt,
      coffre.updatedAt
    );
  }

  async findByUserId(userId: string): Promise<Coffre[]> {
    const coffres = await this.prisma.coffre.findMany({
      where: { idUser: userId },
    });

    return coffres.map(
      (absence) =>
        new Coffre(
          absence.id,
          absence.idUser,
          absence.typeBulletin,
          absence.mois,
          absence.annee,
          absence.note,
          absence.fichierJustificatifPdf,
          absence.createdAt,
          absence.updatedAt
        )
    );
  }

  async findAll(): Promise<Coffre[]> {
    const coffres = await this.prisma.coffre.findMany();

    return coffres.map(
      (coffre) =>
        new Coffre(
          coffre.id,
          coffre.idUser,
          coffre.typeBulletin,
          coffre.mois,
          coffre.annee,
          coffre.note,
          coffre.fichierJustificatifPdf,
          coffre.createdAt,
          coffre.updatedAt
        )
    );
  }

  async create(coffre: Coffre): Promise<Coffre> {
    const createdCoffre = await this.prisma.coffre.create({
      data: {
        idUser: coffre.idUser,
        typeBulletin: coffre.typeBulletin,
        mois: coffre.mois,
        annee: coffre.annee,
        note: coffre.note,
        fichierJustificatifPdf: coffre.fichierJustificatifPdf,
      },
    });

    return new Coffre(
      createdCoffre.id,
      coffre.idUser,
      coffre.typeBulletin,
      coffre.mois,
      coffre.annee,
      coffre.note,
      coffre.fichierJustificatifPdf,
      coffre.createdAt,
      coffre.updatedAt
    );
  }

  async update(id: string, coffreData: Partial<Coffre>): Promise<Coffre> {
    const updateData: any = {};

    if (coffreData.typeBulletin !== undefined)
      updateData.typeBulletin = coffreData.typeBulletin;
    if (coffreData.mois !== undefined) updateData.mois = coffreData.mois;
    if (coffreData.annee !== undefined) updateData.annee = coffreData.annee;
    if (coffreData.note !== undefined) updateData.note = coffreData.note;
    if (coffreData.fichierJustificatifPdf !== undefined)
      updateData.fichierJustificatifPdf = coffreData.fichierJustificatifPdf;

    const updatedCoffre = await this.prisma.coffre.update({
      where: { id },
      data: updateData,
    });

    return new Coffre(
      updatedCoffre.id,
      updatedCoffre.idUser,
      updatedCoffre.typeBulletin,
      updatedCoffre.mois,
      updatedCoffre.annee,
      updatedCoffre.note,
      updatedCoffre.fichierJustificatifPdf,
      updatedCoffre.createdAt,
      updatedCoffre.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.coffre.delete({
      where: { id },
    });
  }
}
