export class Paiement {
  public readonly id: string;
  public readonly idUser: string;
  public readonly iban: string;
  public readonly bic: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: {
    id: string;
    idUser: string;
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
