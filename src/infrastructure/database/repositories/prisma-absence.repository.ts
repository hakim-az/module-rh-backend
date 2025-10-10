import { Injectable } from "@nestjs/common";
import { AbsenceRepository } from "@domain/repositories/absence.repository";
import { Absence } from "@domain/entities/absence.entity";
import { PrismaService } from "../prisma.service";
import { generateUniqueNumericId } from "@/domain/services/generateUniqueNumericId";

@Injectable()
export class PrismaAbsenceRepository implements AbsenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Helper to map Prisma record to entity
  private mapToEntity(absence: any): Absence {
    return new Absence(
      absence.id,
      absence.idUser,
      absence.typeAbsence,
      absence.dateDebut,
      absence.dateFin,
      absence.partieDeJour,
      absence.note,
      absence.statut,
      absence.motifDeRefus,
      absence.fichierJustificatifPdf,
      absence.createdAt,
      absence.updatedAt,
      absence.user
        ? {
            prenom: absence.user.prenom,
            nomDeNaissance: absence.user.nomDeNaissance,
            emailProfessionnel: absence.user.emailProfessionnel,
            emailPersonnel: absence.user.emailPersonnel,
            avatar: absence.user.avatar,
          }
        : undefined
    );
  }

  async findById(id: string): Promise<Absence | null> {
    const absence = await this.prisma.absence.findUnique({ where: { id } });
    return absence ? this.mapToEntity(absence) : null;
  }

  async findByUserId(userId: string): Promise<Absence[]> {
    const absences = await this.prisma.absence.findMany({
      where: { idUser: userId },
    });
    return absences.map(this.mapToEntity);
  }

  async findAll(): Promise<Absence[]> {
    const absences = await this.prisma.absence.findMany({
      include: { user: true },
    });
    return absences.map(this.mapToEntity);
  }

  async create(absence: Absence): Promise<Absence> {
    const id = await generateUniqueNumericId("absence");

    const created = await this.prisma.absence.create({
      data: {
        id,
        typeAbsence: absence.typeAbsence,
        dateDebut: absence.dateDebut,
        dateFin: absence.dateFin,
        partieDeJour: absence.partieDeJour,
        note: absence.note,
        statut: absence.statut,
        motifDeRefus: absence.motifDeRefus,
        fichierJustificatifPdf: absence.fichierJustificatifPdf,
        // connect the user relation using the user's primary key
        user: {
          connect: { id: absence.idUser },
        },
      },
    });

    return this.mapToEntity(created);
  }

  async update(id: string, data: Partial<Absence>): Promise<Absence> {
    const updateData: any = {};

    if (data.typeAbsence !== undefined)
      updateData.typeAbsence = data.typeAbsence;
    if (data.dateDebut !== undefined) updateData.dateDebut = data.dateDebut;
    if (data.dateFin !== undefined) updateData.dateFin = data.dateFin;
    if (data.partieDeJour !== undefined)
      updateData.partieDeJour = data.partieDeJour;
    if (data.note !== undefined) updateData.note = data.note;
    if (data.statut !== undefined) updateData.statut = data.statut;
    if (data.motifDeRefus !== undefined)
      updateData.motifDeRefus = data.motifDeRefus;
    if (data.fichierJustificatifPdf !== undefined)
      updateData.fichierJustificatifPdf = data.fichierJustificatifPdf;

    // handle relation field: Prisma expects relation updates (connect/disconnect) rather than a raw id
    if (data.idUser !== undefined) {
      if (data.idUser === null) {
        updateData.user = { disconnect: true };
      } else {
        updateData.user = { connect: { id: data.idUser } };
      }
    }

    const updated = await this.prisma.absence.update({
      where: { id },
      data: updateData,
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.absence.delete({ where: { id } });
  }
}
