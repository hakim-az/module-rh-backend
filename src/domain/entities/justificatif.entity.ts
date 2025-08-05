export class Justificatif {
  public readonly id: number;
  public readonly idUser: number;
  public readonly fichierCarteVitalePdf: string;
  public readonly fichierRibPdf: string;
  public readonly fichierPieceIdentitePdf: string;
  public readonly fichierJustificatifDomicilePdf: string;
  public readonly fichierAmeli: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: {
    id: number;
    idUser: number;
    fichierCarteVitalePdf: string;
    fichierRibPdf: string;
    fichierPieceIdentitePdf: string;
    fichierJustificatifDomicilePdf: string;
    fichierAmeli: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.idUser = props.idUser;
    this.fichierCarteVitalePdf = props.fichierCarteVitalePdf;
    this.fichierRibPdf = props.fichierRibPdf;
    this.fichierPieceIdentitePdf = props.fichierPieceIdentitePdf;
    this.fichierJustificatifDomicilePdf = props.fichierJustificatifDomicilePdf;
    this.fichierAmeli = props.fichierAmeli;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
