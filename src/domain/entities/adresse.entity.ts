export class Adresse {
  public readonly id: string;
  public readonly idUser: string;
  public readonly pays: string;
  public readonly codePostal: string;
  public readonly ville: string;
  public readonly adresse: string;
  public readonly complementAdresse: string;
  public readonly domiciliteHorsLaFrance: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: {
    id: string;
    idUser: string;
    pays: string;
    codePostal: string;
    ville: string;
    adresse: string;
    complementAdresse: string;
    domiciliteHorsLaFrance: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.idUser = props.idUser;
    this.pays = props.pays;
    this.codePostal = props.codePostal;
    this.ville = props.ville;
    this.adresse = props.adresse;
    this.complementAdresse = props.complementAdresse;
    this.domiciliteHorsLaFrance = props.domiciliteHorsLaFrance;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
