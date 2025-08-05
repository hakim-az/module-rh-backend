import { Injectable } from "@nestjs/common";
import { AbsenceRepository } from "@domain/repositories/absence.repository";
import { Absence } from "@domain/entities/absence.entity";
import { PrismaService } from "../prisma.service";
import { generateUniqueNumericId } from "@/domain/services/generate-id.service";

@Injectable()
export class PrismaAbsenceRepository implements AbsenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Absence | null> {
    const absence = await this.prisma.absence.findUnique({
      where: { id },
    });

    if (!absence) return null;

    return new Absence(
      absence.id,
      absence.idUser,
      absence.typeAbsence,
      absence.dateDebut,
      absence.dateFin,
      absence.note,
      absence.statut,
      absence.motifDeRefus,
      absence.fichierJustificatifPdf,
      absence.createdAt,
      absence.updatedAt
    );
  }

  async findByUserId(userId: string): Promise<Absence[]> {
    const absences = await this.prisma.absence.findMany({
      where: { idUser: userId },
    });

    return absences.map(
      (absence) =>
        new Absence(
          absence.id,
          absence.idUser,
          absence.typeAbsence,
          absence.dateDebut,
          absence.dateFin,
          absence.note,
          absence.statut,
          absence.motifDeRefus,
          absence.fichierJustificatifPdf,
          absence.createdAt,
          absence.updatedAt
        )
    );
  }

  async findAll(): Promise<Absence[]> {
    const absences = await this.prisma.absence.findMany({
      include: { user: true }, // 👈 includes user relation
    });

    return absences.map(
      (absence) =>
        new Absence(
          absence.id,
          absence.idUser,
          absence.typeAbsence,
          absence.dateDebut,
          absence.dateFin,
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
                avatar: absence.user.avatar,
              }
            : undefined
        )
    );
  }

  async create(absence: Absence): Promise<Absence> {
    const id = await generateUniqueNumericId("absence");
    const createdAbsence = await this.prisma.absence.create({
      data: {
        id: id,
        idUser: absence.idUser,
        typeAbsence: absence.typeAbsence,
        dateDebut: absence.dateDebut,
        dateFin: absence.dateFin,
        note: absence.note,
        statut: absence.statut,
        motifDeRefus: absence.motifDeRefus,
        fichierJustificatifPdf: absence.fichierJustificatifPdf,
      },
    });

    return new Absence(
      createdAbsence.id,
      absence.idUser,
      absence.typeAbsence,
      absence.dateDebut,
      absence.dateFin,
      absence.note,
      absence.statut,
      absence.motifDeRefus,
      absence.fichierJustificatifPdf,
      absence.createdAt,
      absence.updatedAt
    );
  }

  async update(id: string, absenceData: Partial<Absence>): Promise<Absence> {
    const updateData: any = {};

    if (absenceData.typeAbsence !== undefined)
      updateData.typeAbsence = absenceData.typeAbsence;
    if (absenceData.dateDebut !== undefined)
      updateData.dateDebut = absenceData.dateDebut;
    if (absenceData.dateFin !== undefined)
      updateData.dateFin = absenceData.dateFin;
    if (absenceData.note !== undefined) updateData.note = absenceData.note;
    if (absenceData.statut !== undefined)
      updateData.statut = absenceData.statut;
    if (absenceData.motifDeRefus !== undefined)
      updateData.motifDeRefus = absenceData.motifDeRefus;
    if (absenceData.fichierJustificatifPdf !== undefined)
      updateData.fichierJustificatifPdf = absenceData.fichierJustificatifPdf;

    const updatedAbsence = await this.prisma.absence.update({
      where: { id },
      data: updateData,
    });

    return new Absence(
      updatedAbsence.id,
      updatedAbsence.idUser,
      updatedAbsence.typeAbsence,
      updatedAbsence.dateDebut,
      updatedAbsence.dateFin,
      updatedAbsence.note,
      updatedAbsence.statut,
      updatedAbsence.motifDeRefus,
      updatedAbsence.fichierJustificatifPdf,
      updatedAbsence.createdAt,
      updatedAbsence.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.absence.delete({
      where: { id },
    });
  }
}
function uuidv4(): any {
  throw new Error("Function not implemented.");
}
