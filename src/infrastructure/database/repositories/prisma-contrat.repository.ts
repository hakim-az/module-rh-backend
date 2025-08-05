import { Injectable } from "@nestjs/common";
import { ContratRepository } from "@domain/repositories/contrat.repository";
import { Contrat } from "@domain/entities/contrat.entity";
import { PrismaService } from "../prisma.service";
import { generateUniqueNumericId } from "@/domain/services/generate-id.service";

@Injectable()
export class PrismaContratRepository implements ContratRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Contrat | null> {
    const contrat = await this.prisma.contrat.findUnique({
      where: { id },
    });

    if (!contrat) return null;

    return new Contrat(
      contrat.id,
      contrat.idUser,
      contrat.poste,
      contrat.typeContrat,
      contrat.dateDebut,
      contrat.dateFin,
      contrat.etablissementDeSante,
      contrat.serviceDeSante,
      contrat.salaire,
      contrat.matricule,
      contrat.fichierContratNonSignerPdf,
      contrat.fichierContratSignerPdf,
      contrat.createdAt,
      contrat.updatedAt
    );
  }

  async findByUserId(userId: string): Promise<Contrat[]> {
    const contrats = await this.prisma.contrat.findMany({
      where: { idUser: userId },
    });

    return contrats.map(
      (contrat) =>
        new Contrat(
          contrat.id,
          contrat.idUser,
          contrat.poste,
          contrat.typeContrat,
          contrat.dateDebut,
          contrat.dateFin,
          contrat.etablissementDeSante,
          contrat.serviceDeSante,
          contrat.salaire,
          contrat.matricule,
          contrat.fichierContratNonSignerPdf,
          contrat.fichierContratSignerPdf,
          contrat.createdAt,
          contrat.updatedAt
        )
    );
  }

  async findAll(): Promise<Contrat[]> {
    const contrats = await this.prisma.contrat.findMany();

    return contrats.map(
      (contrat) =>
        new Contrat(
          contrat.id,
          contrat.idUser,
          contrat.poste,
          contrat.typeContrat,
          contrat.dateDebut,
          contrat.dateFin,
          contrat.etablissementDeSante,
          contrat.serviceDeSante,
          contrat.salaire,
          contrat.matricule,
          contrat.fichierContratNonSignerPdf,
          contrat.fichierContratSignerPdf,
          contrat.createdAt,
          contrat.updatedAt
        )
    );
  }

  async create(contrat: Contrat): Promise<Contrat> {
    const id = await generateUniqueNumericId("contrat");
    const createdContrat = await this.prisma.contrat.create({
      data: {
        id: id,
        idUser: contrat.idUser,
        poste: contrat.poste,
        typeContrat: contrat.typeContrat,
        dateDebut: contrat.dateDebut,
        dateFin: contrat.dateFin,
        etablissementDeSante: contrat.etablissementDeSante,
        serviceDeSante: contrat.serviceDeSante,
        salaire: contrat.salaire,
        matricule: contrat.matricule,
        fichierContratNonSignerPdf: contrat.fichierContratNonSignerPdf,
        fichierContratSignerPdf: contrat.fichierContratSignerPdf,
      },
    });

    return new Contrat(
      createdContrat.id,
      contrat.idUser,
      contrat.poste,
      contrat.typeContrat,
      contrat.dateDebut,
      contrat.dateFin,
      contrat.etablissementDeSante,
      contrat.serviceDeSante,
      contrat.salaire,
      contrat.matricule,
      contrat.fichierContratNonSignerPdf,
      contrat.fichierContratSignerPdf,
      contrat.createdAt,
      contrat.updatedAt
    );
  }

  async update(id: string, contratData: Partial<Contrat>): Promise<Contrat> {
    const updateData: any = {};

    if (contratData.poste) updateData.poste = contratData.poste;
    if (contratData.typeContrat)
      updateData.typeContrat = contratData.typeContrat;
    if (contratData.dateDebut) updateData.dateDebut = contratData.dateDebut;
    if (contratData.dateFin) updateData.dateFin = contratData.dateFin;
    if (contratData.etablissementDeSante)
      updateData.etablissementDeSante = contratData.etablissementDeSante;
    if (contratData.serviceDeSante)
      updateData.serviceDeSante = contratData.serviceDeSante;
    if (contratData.matricule) updateData.matricule = contratData.matricule;
    if (contratData.salaire) updateData.salaire = contratData.salaire;
    if (contratData.fichierContratNonSignerPdf !== undefined)
      updateData.fichierContratNonSignerPdf =
        contratData.fichierContratNonSignerPdf;
    if (contratData.fichierContratSignerPdf !== undefined)
      updateData.fichierContratSignerPdf = contratData.fichierContratSignerPdf;

    const updatedContrat = await this.prisma.contrat.update({
      where: { id },
      data: updateData,
    });

    return new Contrat(
      updatedContrat.id,
      updatedContrat.idUser,
      updatedContrat.poste,
      updatedContrat.typeContrat,
      updatedContrat.dateDebut,
      updatedContrat.dateFin,
      updatedContrat.etablissementDeSante,
      updatedContrat.serviceDeSante,
      updatedContrat.salaire,
      updatedContrat.matricule,
      updatedContrat.fichierContratNonSignerPdf,
      updatedContrat.fichierContratSignerPdf,
      updatedContrat.createdAt,
      updatedContrat.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contrat.delete({
      where: { id },
    });
  }
}
