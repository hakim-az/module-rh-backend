export class Paiement {
  public readonly id: number;
  public readonly idUser: number;
  public readonly iban: string;
  public readonly bic: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: {
    id: number;
    idUser: number;
    iban: string;
    bic: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.idUser = props.idUser;
    this.iban = props.iban;
    this.bic = props.bic;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
