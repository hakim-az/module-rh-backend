export class Contrat {
  public readonly id: string;
  public readonly idUser: string;
  public readonly poste: string;
  public readonly typeContrat: string;
  public readonly dateDebut: Date;
  public readonly dateFin: Date;
  public readonly etablissementDeSante: string;
  public readonly serviceDeSante: string;
  public readonly fichierContratNonSignerPdf?: string;
  public readonly fichierContratSignerPdf?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: {
    id: string;
    idUser: string;
    poste: string;
    typeContrat: string;
    dateDebut: Date;
    dateFin: Date;
    etablissementDeSante: string;
    serviceDeSante: string;
    fichierContratNonSignerPdf?: string;
    fichierContratSignerPdf?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.idUser = props.idUser;
    this.poste = props.poste;
    this.typeContrat = props.typeContrat;
    this.dateDebut = props.dateDebut;
    this.dateFin = props.dateFin;
    this.etablissementDeSante = props.etablissementDeSante;
    this.serviceDeSante = props.serviceDeSante;
    this.fichierContratNonSignerPdf = props.fichierContratNonSignerPdf;
    this.fichierContratSignerPdf = props.fichierContratSignerPdf;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
