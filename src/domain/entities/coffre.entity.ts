export class Coffre {
  constructor(
    public readonly id: string,
    public readonly idUser: string,
    public readonly typeBulletin: string,
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
    idUser: string,
    typeBulletin: string,
    mois: string,
    annee: string,
    note?: string,
    fichierJustificatifPdf?: string
  ): Coffre {
    return new Coffre(
      "0",
      idUser,
      typeBulletin,
      mois,
      annee,
      note,
      fichierJustificatifPdf,
      new Date(),
      new Date()
    );
  }
}
