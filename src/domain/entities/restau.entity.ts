export class Restau {
  constructor(
    public readonly id: number,
    public readonly idUser: number,
    public readonly nbrJours: string,
    public readonly mois: string,
    public readonly annee: string,
    public readonly note?: string,
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
    idUser: number,
    nbrJours: string,
    mois: string,
    annee: string,
    note?: string,
    fichierJustificatifPdf?: string
  ): Restau {
    return new Restau(
      0,
      idUser,
      nbrJours,
      mois,
      annee,
      note,
      fichierJustificatifPdf,
      new Date(),
      new Date()
    );
  }
}
