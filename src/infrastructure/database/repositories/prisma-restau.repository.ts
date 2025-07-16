import { Injectable } from "@nestjs/common";
import { RestauRepository } from "@domain/repositories/restau.repository";
import { Restau } from "@domain/entities/restau.entity";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PrismaRestauRepository implements RestauRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Restau | null> {
    const restau = await this.prisma.restau.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!restau) return null;

    return new Restau(
      restau.id,
      restau.idUser,
      restau.nbrJours,
      restau.mois,
      restau.annee,
      restau.note,
      restau.fichierJustificatifPdf,
      restau.createdAt,
      restau.updatedAt,
      restau.user
        ? {
            prenom: restau.user.prenom,
            nomDeNaissance: restau.user.nomDeNaissance,
            emailProfessionnel: restau.user.emailProfessionnel,
            avatar: restau.user.avatar,
          }
        : undefined
    );
  }

  async findByUserId(userId: string): Promise<Restau[]> {
    const restaux = await this.prisma.restau.findMany({
      where: { idUser: userId },
    });

    return restaux.map(
      (restau) =>
        new Restau(
          restau.id,
          restau.idUser,
          restau.nbrJours,
          restau.mois,
          restau.annee,
          restau.note,
          restau.fichierJustificatifPdf,
          restau.createdAt,
          restau.updatedAt
        )
    );
  }

  async findAll(): Promise<Restau[]> {
    const restaux = await this.prisma.restau.findMany({
      include: { user: true },
    });

    return restaux.map(
      (restau) =>
        new Restau(
          restau.id,
          restau.idUser,
          restau.nbrJours,
          restau.mois,
          restau.annee,
          restau.note,
          restau.fichierJustificatifPdf,
          restau.createdAt,
          restau.updatedAt,
          restau.user
            ? {
                prenom: restau.user.prenom,
                nomDeNaissance: restau.user.nomDeNaissance,
                emailProfessionnel: restau.user.emailProfessionnel,
                avatar: restau.user.avatar,
              }
            : undefined
        )
    );
  }

  async create(restau: Restau): Promise<Restau> {
    const createdRestau = await this.prisma.restau.create({
      data: {
        idUser: restau.idUser,
        nbrJours: restau.nbrJours,
        mois: restau.mois,
        annee: restau.annee,
        note: restau.note,
        fichierJustificatifPdf: restau.fichierJustificatifPdf,
      },
    });

    return new Restau(
      createdRestau.id,
      restau.idUser,
      restau.nbrJours,
      restau.mois,
      restau.annee,
      restau.note,
      restau.fichierJustificatifPdf,
      restau.createdAt,
      restau.updatedAt
    );
  }

  async update(id: string, restauData: Partial<Restau>): Promise<Restau> {
    const updateData: any = {};

    if (restauData.nbrJours !== undefined)
      updateData.nbrJours = restauData.nbrJours;
    if (restauData.mois !== undefined) updateData.mois = restauData.mois;
    if (restauData.annee !== undefined) updateData.annee = restauData.annee;
    if (restauData.note !== undefined) updateData.note = restauData.note;
    if (restauData.fichierJustificatifPdf !== undefined)
      updateData.fichierJustificatifPdf = restauData.fichierJustificatifPdf;

    const updatedRestau = await this.prisma.restau.update({
      where: { id },
      data: updateData,
    });

    return new Restau(
      updatedRestau.id,
      updatedRestau.idUser,
      updatedRestau.nbrJours,
      updatedRestau.mois,
      updatedRestau.annee,
      updatedRestau.note,
      updatedRestau.fichierJustificatifPdf,
      updatedRestau.createdAt,
      updatedRestau.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.restau.delete({
      where: { id },
    });
  }
}
