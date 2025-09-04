export class Justificatif {
  public readonly id: string;
  public readonly idUser: string;
  public readonly fichierCarteVitalePdf: string;
  public readonly fichierRibPdf: string;
  public readonly fichierPieceIdentitePdf: string;
  public readonly fichierPieceIdentitePdfVerso: string;
  public readonly fichierJustificatifDomicilePdf: string;
  public readonly fichierAmeli: string;
  public readonly autreFichier: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: {
    id: string;
    idUser: string;
    fichierCarteVitalePdf: string;
    fichierRibPdf: string;
    fichierPieceIdentitePdf: string;
    fichierPieceIdentitePdfVerso: string;
    fichierJustificatifDomicilePdf: string;
    fichierAmeli: string;
    autreFichier: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.idUser = props.idUser;
    this.fichierCarteVitalePdf = props.fichierCarteVitalePdf;
    this.fichierRibPdf = props.fichierRibPdf;
    this.fichierPieceIdentitePdf = props.fichierPieceIdentitePdf;
    this.fichierPieceIdentitePdfVerso = props.fichierPieceIdentitePdfVerso;
    this.fichierJustificatifDomicilePdf = props.fichierJustificatifDomicilePdf;
    this.fichierAmeli = props.fichierAmeli;
    this.autreFichier = props.autreFichier;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
