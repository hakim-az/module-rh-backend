export class Absence {
  constructor(
    public readonly id: string,
    public readonly idUser: string,
    public readonly typeAbsence: string,
    public readonly dateDebut: Date,
    public readonly dateFin: Date,
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
      avatar: string;
    }
  ) {}

  public static create(
    idUser: string,
    typeAbsence: string,
    dateDebut: Date,
    dateFin: Date,
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
      note,
      statut,
      motifDeRefus,
      fichierJustificatifPdf,
      new Date(),
      new Date()
    );
  }
}
