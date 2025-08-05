export class Urgence {
  public readonly id: number;
  public readonly idUser: number;
  public readonly nomComplet: string;
  public readonly lienAvecLeSalarie: string;
  public readonly telephone: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: {
    id: number;
    idUser: number;
    nomComplet: string;
    lienAvecLeSalarie: string;
    telephone: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.idUser = props.idUser;
    this.nomComplet = props.nomComplet;
    this.lienAvecLeSalarie = props.lienAvecLeSalarie;
    this.telephone = props.telephone;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
