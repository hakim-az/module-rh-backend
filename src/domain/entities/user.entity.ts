export class User {
  public readonly id: string;
  public readonly role: string;
  public readonly statut: string;
  public readonly civilite: string;
  public readonly prenom: string;
  public readonly nomDeNaissance: string;
  public readonly nomUsuel: string;
  public readonly situationFamiliale: string;
  public readonly numeroSecuriteSociale: string;
  public readonly emailPersonnel: string;
  public readonly emailProfessionnel: string;
  public readonly telephonePersonnel: string;
  public readonly telephoneProfessionnel: string;
  public readonly avatar: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  // Relations (optionnelles)
  public readonly naissance?: any;
  public readonly adresse?: any;
  public readonly paiement?: any;
  public readonly urgence?: any;
  public readonly justificatif?: any;
  public readonly contrat?: any;

  constructor(props: {
    id: string;
    role: string;
    statut: string;
    civilite: string;
    prenom: string;
    nomDeNaissance: string;
    nomUsuel: string;
    situationFamiliale: string;
    numeroSecuriteSociale: string;
    emailPersonnel: string;
    emailProfessionnel: string;
    telephonePersonnel: string;
    telephoneProfessionnel: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;

    naissance?: any;
    adresse?: any;
    paiement?: any;
    urgence?: any;
    justificatif?: any;
    contrat?: any;
  }) {
    this.id = props.id;
    this.role = props.role;
    this.statut = props.statut;
    this.civilite = props.civilite;
    this.prenom = props.prenom;
    this.nomDeNaissance = props.nomDeNaissance;
    this.nomUsuel = props.nomUsuel;
    this.situationFamiliale = props.situationFamiliale;
    this.numeroSecuriteSociale = props.numeroSecuriteSociale;
    this.emailPersonnel = props.emailPersonnel;
    this.emailProfessionnel = props.emailProfessionnel;
    this.telephonePersonnel = props.telephonePersonnel;
    this.telephoneProfessionnel = props.telephoneProfessionnel;
    this.avatar = props.avatar;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.naissance = props.naissance;
    this.adresse = props.adresse;
    this.paiement = props.paiement;
    this.urgence = props.urgence;
    this.justificatif = props.justificatif;
    this.contrat = props.contrat;
  }
}
