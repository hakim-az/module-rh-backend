export class Naissance {
  public readonly id: string;
  public readonly idUser: string;
  public readonly dateDeNaissance: Date;
  public readonly paysDeNaissance: string;
  public readonly departementDeNaissance: string;
  public readonly communeDeNaissance: string;
  public readonly paysDeNationalite: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: {
    id: string;
    idUser: string;
    dateDeNaissance: Date;
    paysDeNaissance: string;
    departementDeNaissance: string;
    communeDeNaissance: string;
    paysDeNationalite: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.idUser = props.idUser;
    this.dateDeNaissance = props.dateDeNaissance;
    this.paysDeNaissance = props.paysDeNaissance;
    this.departementDeNaissance = props.departementDeNaissance;
    this.communeDeNaissance = props.communeDeNaissance;
    this.paysDeNationalite = props.paysDeNationalite;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
