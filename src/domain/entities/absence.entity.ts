export class Absence {
  type(type: any) {
    throw new Error("Method not implemented.");
  }
  constructor(
    public readonly id: string,
    public readonly idUser: string,
    public readonly typeAbsence: string,
    public readonly dateDebut: Date,
    public readonly dateFin: Date,
    public readonly partieDeJour?: string,
    public readonly note?: string,
    public readonly statut?: string,
    public readonly motifDeRefus?: string,
    public readonly fichierJustificatifPdf?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly user?: {
      prenom: string;
      nomDeNaissance: string;
      emailProfessionnel: string;
      emailPersonnel: string;
      avatar: string;
    }
  ) {}

  public static create(
    idUser: string,
    typeAbsence: string,
    dateDebut: Date,
    dateFin: Date,
    partieDeJour: string,
    note?: string,
    statut?: string,
    motifDeRefus?: string,
    fichierJustificatifPdf?: string
  ): Absence {
    return new Absence(
      "0",
      idUser,
      typeAbsence,
      dateDebut,
      dateFin,
      partieDeJour,
      note,
      statut,
      motifDeRefus,
      fichierJustificatifPdf,
      new Date(),
      new Date()
    );
  }
}
