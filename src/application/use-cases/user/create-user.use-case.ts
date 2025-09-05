import { Injectable, Inject } from "@nestjs/common";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { NaissanceRepository } from "../../../domain/repositories/naissance.repository";
import { AdresseRepository } from "../../../domain/repositories/adresse.repository";
import { PaiementRepository } from "../../../domain/repositories/paiement.repository";
import { UrgenceRepository } from "../../../domain/repositories/urgence.repository";
import { JustificatifRepository } from "../../../domain/repositories/justificatif.repository";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { User } from "../../../domain/entities/user.entity";
import { CreateUserDto } from "../../dtos/user.dto";
import { ContratRepository } from "../../../domain/repositories/contrat.repository";

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,

    @Inject(NaissanceRepository)
    private readonly naissanceRepository: NaissanceRepository,

    @Inject(AdresseRepository)
    private readonly adresseRepository: AdresseRepository,

    @Inject(PaiementRepository)
    private readonly paiementRepository: PaiementRepository,

    @Inject(UrgenceRepository)
    private readonly urgenceRepository: UrgenceRepository,

    @Inject(JustificatifRepository)
    private readonly justificatifRepository: JustificatifRepository,

    @Inject(ContratRepository)
    private readonly contratRepository: ContratRepository,

    private readonly prisma: PrismaService
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.emailPersonnel
    );
    if (existingUser) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    return await this.prisma.$transaction(async () => {
      const userData = {
        id: createUserDto.id,
        role: createUserDto.role,
        statut: createUserDto.statut,
        civilite: createUserDto.civilite,
        prenom: createUserDto.prenom,
        nomDeNaissance: createUserDto.nomDeNaissance,
        nomUsuel: createUserDto.nomUsuel,
        situationFamiliale: createUserDto.situationFamiliale,
        numeroSecuriteSociale: createUserDto.numeroSecuriteSociale,
        emailPersonnel: createUserDto.emailPersonnel,
        emailProfessionnel: createUserDto.emailProfessionnel,
        telephonePersonnel: createUserDto.telephonePersonnel,
        telephoneProfessionnel: createUserDto.telephoneProfessionnel,
        avatar: createUserDto.avatar,
      };

      const user = await this.userRepository.create(userData);

      if (createUserDto.naissance) {
        await this.naissanceRepository.create({
          idUser: user.id,
          dateDeNaissance: new Date(createUserDto.naissance.dateDeNaissance),
          paysDeNaissance: createUserDto.naissance.paysDeNaissance,
          departementDeNaissance:
            createUserDto.naissance.departementDeNaissance,
          communeDeNaissance: createUserDto.naissance.communeDeNaissance,
          paysDeNationalite: createUserDto.naissance.paysDeNationalite,
        });
      }

      if (createUserDto.adresse) {
        await this.adresseRepository.create({
          idUser: user.id,
          pays: createUserDto.adresse.pays,
          codePostal: createUserDto.adresse.codePostal,
          ville: createUserDto.adresse.ville,
          adresse: createUserDto.adresse.adresse,
          complementAdresse: createUserDto.adresse.complementAdresse,
          domiciliteHorsLaFrance: createUserDto.adresse.domiciliteHorsLaFrance,
        });
      }

      if (createUserDto.paiement) {
        await this.paiementRepository.create({
          idUser: user.id,
          iban: createUserDto.paiement.iban,
          bic: createUserDto.paiement.bic,
        });
      }

      if (createUserDto.urgence) {
        await this.urgenceRepository.create({
          idUser: user.id,
          nomComplet: createUserDto.urgence.nomComplet,
          lienAvecLeSalarie: createUserDto.urgence.lienAvecLeSalarie,
          telephone: createUserDto.urgence.telephone,
        });
      }

      if (createUserDto.justificatif) {
        await this.justificatifRepository.create({
          idUser: user.id,
          fichierCarteVitalePdf:
            createUserDto.justificatif.fichierCarteVitalePdf || "",
          fichierRibPdf: createUserDto.justificatif.fichierRibPdf || "",
          fichierPieceIdentitePdf:
            createUserDto.justificatif.fichierPieceIdentitePdf || "",
          fichierPieceIdentitePdfVerso:
            createUserDto.justificatif.fichierPieceIdentitePdfVerso || "",
          fichierJustificatifDomicilePdf:
            createUserDto.justificatif.fichierJustificatifDomicilePdf || "",
          fichierAmeli: createUserDto.justificatif.fichierAmeli || "",
          autreFichier: createUserDto.justificatif.autreFichier || "",
        });
      }

      if (createUserDto.contrat) {
        await this.contratRepository.create({
          idUser: user.id,
          poste: createUserDto.contrat.poste,
          typeContrat: createUserDto.contrat.typeContrat,
          dateDebut: new Date(createUserDto.contrat.dateDebut),
          dateFin: new Date(createUserDto.contrat.dateFin),
          matricule: createUserDto.contrat.matricule,
          etablissementDeSante: createUserDto.contrat.etablissementDeSante,
          serviceDeSante: createUserDto.contrat.serviceDeSante,
          salaire: createUserDto.contrat.salaire,
          fichierContratSignerPdf:
            createUserDto.contrat.fichierContratSignerPdf || "",
          id: "",
        });
      }

      return this.userRepository.findById(user.id);
    });
  }
}
