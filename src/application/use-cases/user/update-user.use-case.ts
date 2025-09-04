import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { NaissanceRepository } from "../../../domain/repositories/naissance.repository";
import { AdresseRepository } from "../../../domain/repositories/adresse.repository";
import { PaiementRepository } from "../../../domain/repositories/paiement.repository";
import { UrgenceRepository } from "../../../domain/repositories/urgence.repository";
import { JustificatifRepository } from "../../../domain/repositories/justificatif.repository";
import { ContratRepository } from "../../../domain/repositories/contrat.repository";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

import { User } from "../../../domain/entities/user.entity";
import { UpdateUserDto } from "../../dtos/user.dto";
import { Naissance } from "@/domain/entities/naissance.entity";

@Injectable()
export class UpdateUserUseCase {
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

  async execute(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error("Utilisateur non trouvé");
    }

    return this.prisma.$transaction(async () => {
      // Mise à jour des données de base
      await this.userRepository.update(id, updateUserDto);

      // Naissance
      if (updateUserDto.naissance) {
        const naissanceExist = await this.naissanceRepository.findByUserId(id);

        if (naissanceExist) {
          // Extraire les champs en toute sécurité
          const {
            dateDeNaissance,
            paysDeNaissance,
            departementDeNaissance,
            communeDeNaissance,
            paysDeNationalite,
          } = updateUserDto.naissance;

          // Créer un objet avec conversion explicite de la date (si présente)
          const naissanceData: Partial<Naissance> = {
            ...(dateDeNaissance
              ? { dateDeNaissance: new Date(dateDeNaissance) }
              : {}),
            ...(paysDeNaissance ? { paysDeNaissance } : {}),
            ...(departementDeNaissance ? { departementDeNaissance } : {}),
            ...(communeDeNaissance ? { communeDeNaissance } : {}),
            ...(paysDeNationalite ? { paysDeNationalite } : {}),
          };

          await this.naissanceRepository.update(
            naissanceExist.id,
            naissanceData
          );
        } else {
          const naissanceDto = updateUserDto.naissance;

          const hasAllRequiredFields =
            naissanceDto.dateDeNaissance &&
            naissanceDto.paysDeNaissance &&
            naissanceDto.departementDeNaissance &&
            naissanceDto.communeDeNaissance &&
            naissanceDto.paysDeNationalite;

          if (hasAllRequiredFields) {
            await this.naissanceRepository.create({
              idUser: id,
              dateDeNaissance: new Date(naissanceDto.dateDeNaissance),
              paysDeNaissance: naissanceDto.paysDeNaissance,
              departementDeNaissance: naissanceDto.departementDeNaissance,
              communeDeNaissance: naissanceDto.communeDeNaissance,
              paysDeNationalite: naissanceDto.paysDeNationalite,
            });
          } else {
            throw new Error("Champs requis manquants pour créer naissance");
          }
        }
      }

      // Adresse
      if (updateUserDto.adresse) {
        const adresseExist = await this.adresseRepository.findByUserId(id);
        const {
          pays,
          codePostal,
          ville,
          adresse,
          complementAdresse,
          domiciliteHorsLaFrance,
        } = updateUserDto.adresse;

        const adresseData = {
          ...(pays ? { pays } : {}),
          ...(codePostal ? { codePostal } : {}),
          ...(ville ? { ville } : {}),
          ...(adresse ? { adresse } : {}),
          ...(complementAdresse ? { complementAdresse } : {}),
          ...(domiciliteHorsLaFrance !== undefined
            ? { domiciliteHorsLaFrance }
            : {}),
        };

        if (adresseExist) {
          await this.adresseRepository.update(adresseExist.id, adresseData);
        } else {
          const hasAllAdresseFields = pays && codePostal && ville && adresse;

          if (hasAllAdresseFields) {
            await this.adresseRepository.create({
              idUser: id,
              pays,
              codePostal,
              ville,
              adresse,
              complementAdresse,
              domiciliteHorsLaFrance,
            });
          } else {
            throw new Error("Champs requis manquants pour créer adresse");
          }
        }
      }

      // Paiement
      if (updateUserDto.paiement) {
        const paiementExist = await this.paiementRepository.findByUserId(id);
        const { iban, bic } = updateUserDto.paiement;

        const paiementData = {
          ...(iban ? { iban } : {}),
          ...(bic ? { bic } : {}),
        };

        if (paiementExist) {
          await this.paiementRepository.update(paiementExist.id, paiementData);
        } else {
          const hasAllPaiementFields = iban && bic;

          if (hasAllPaiementFields) {
            await this.paiementRepository.create({
              idUser: id,
              iban,
              bic,
            });
          } else {
            throw new Error("Champs requis manquants pour créer paiement");
          }
        }
      }

      // Urgence
      if (updateUserDto.urgence) {
        const urgenceExist = await this.urgenceRepository.findByUserId(id);
        const { nomComplet, lienAvecLeSalarie, telephone } =
          updateUserDto.urgence;

        const urgenceData = {
          ...(nomComplet ? { nomComplet } : {}),
          ...(lienAvecLeSalarie ? { lienAvecLeSalarie } : {}),
          ...(telephone ? { telephone } : {}),
        };

        if (urgenceExist) {
          await this.urgenceRepository.update(urgenceExist.id, urgenceData);
        } else {
          const hasAllUrgenceFields =
            nomComplet && lienAvecLeSalarie && telephone;

          if (hasAllUrgenceFields) {
            await this.urgenceRepository.create({
              idUser: id,
              nomComplet,
              lienAvecLeSalarie,
              telephone,
            });
          } else {
            throw new Error("Champs requis manquants pour créer urgence");
          }
        }
      }

      // Justificatif
      if (updateUserDto.justificatif) {
        const justificatifExist =
          await this.justificatifRepository.findByUserId(id);
        const {
          fichierCarteVitalePdf,
          fichierRibPdf,
          fichierPieceIdentitePdf,
          fichierPieceIdentitePdfVerso,
          fichierJustificatifDomicilePdf,
          fichierAmeli,
          autreFichier,
        } = updateUserDto.justificatif;

        const justificatifData = {
          ...(fichierCarteVitalePdf ? { fichierCarteVitalePdf } : {}),
          ...(fichierRibPdf ? { fichierRibPdf } : {}),
          ...(fichierPieceIdentitePdf ? { fichierPieceIdentitePdf } : {}),
          ...(fichierPieceIdentitePdfVerso
            ? { fichierPieceIdentitePdfVerso }
            : {}),
          ...(fichierJustificatifDomicilePdf
            ? { fichierJustificatifDomicilePdf }
            : {}),
          ...(fichierAmeli ? { fichierAmeli } : {}),
          ...(autreFichier ? { autreFichier } : {}),
        };

        if (justificatifExist) {
          await this.justificatifRepository.update(
            justificatifExist.id,
            justificatifData
          );
        } else {
          const hasAllJustificatifFields =
            fichierCarteVitalePdf &&
            fichierRibPdf &&
            fichierPieceIdentitePdf &&
            fichierPieceIdentitePdfVerso &&
            fichierJustificatifDomicilePdf &&
            fichierAmeli &&
            autreFichier;

          if (hasAllJustificatifFields) {
            await this.justificatifRepository.create({
              idUser: id,
              fichierCarteVitalePdf: fichierCarteVitalePdf || "",
              fichierRibPdf: fichierRibPdf || "",
              fichierPieceIdentitePdf: fichierPieceIdentitePdf || "",
              fichierPieceIdentitePdfVerso: fichierPieceIdentitePdfVerso || "",
              fichierJustificatifDomicilePdf:
                fichierJustificatifDomicilePdf || "",
              fichierAmeli: fichierAmeli || "",
              autreFichier: autreFichier || "",
            });
          } else {
            // Create justificatif with available fields, empty strings for missing ones
            await this.justificatifRepository.create({
              idUser: id,
              fichierCarteVitalePdf: fichierCarteVitalePdf || "",
              fichierRibPdf: fichierRibPdf || "",
              fichierPieceIdentitePdf: fichierPieceIdentitePdf || "",
              fichierPieceIdentitePdfVerso: fichierPieceIdentitePdfVerso || "",
              fichierJustificatifDomicilePdf:
                fichierJustificatifDomicilePdf || "",
              fichierAmeli: fichierAmeli || "",
              autreFichier: autreFichier || "",
            });
          }
        }
      }

      return this.userRepository.findById(id);
    });
  }
}
