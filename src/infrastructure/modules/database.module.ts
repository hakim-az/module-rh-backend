import { Module } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { PrismaUserRepository } from "../database/repositories/prisma-user.repository";
import { UserRepository } from "../../domain/repositories/user.repository";
import { NaissanceRepository } from "../../domain/repositories/naissance.repository";
import { PrismaNaissanceRepository } from "../database/repositories/prisma-naissance.repository";
import { AdresseRepository } from "@/domain/repositories/adresse.repository";
import { PaiementRepository } from "@/domain/repositories/paiement.repository";
import { PrismaPaiementRepository } from "../database/repositories/prisma-paiement.repository";
import { UrgenceRepository } from "@/domain/repositories/urgence.repository";
import { PrismaUrgenceRepository } from "../database/repositories/prisma-urgence.repository";
import { JustificatifRepository } from "@/domain/repositories/justificatif.repository";
import { PrismaJustificatifRepository } from "../database/repositories/prisma-justificatif.repository";
import { ContratRepository } from "@/domain/repositories/contrat.repository";
import { PrismaContratRepository } from "../database/repositories/prisma-contrat.repository";
import { PrismaAdresseRepository } from "../database/repositories/prisma-adresse.repository";

@Module({
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: NaissanceRepository,
      useClass: PrismaNaissanceRepository,
    },
    {
      provide: AdresseRepository,
      useClass: PrismaAdresseRepository,
    },
    {
      provide: PaiementRepository,
      useClass: PrismaPaiementRepository,
    },
    {
      provide: UrgenceRepository,
      useClass: PrismaUrgenceRepository,
    },
    {
      provide: JustificatifRepository,
      useClass: PrismaJustificatifRepository,
    },
    {
      provide: ContratRepository,
      useClass: PrismaContratRepository,
    },
  ],
  exports: [
    PrismaService,
    UserRepository,
    NaissanceRepository,
    AdresseRepository,
    PaiementRepository,
    UrgenceRepository,
    JustificatifRepository,
    ContratRepository,
  ],
})
export class DatabaseModule {}
