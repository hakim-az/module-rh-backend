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
import { AbsenceRepository } from "@/domain/repositories/absence.repository";
import { PrismaAbsenceRepository } from "../database/repositories/prisma-absence.repository";
import { CoffreRepository } from "@/domain/repositories/coffre.repository";
import { PrismaCoffreRepository } from "../database/repositories/prisma-coffre.repository";
import { PrismaRestauRepository } from "../database/repositories/prisma-restau.repository";
import { RestauRepository } from "@/domain/repositories/restau.repository";
import { NotificationRepository } from "@/domain/repositories/notification.repository";
import { PrismaNotificationRepository } from "../database/repositories/prisma-notification.repository";
import { PrismaUserEmailRepository } from "../database/repositories/prisma-user-email.repository";
import { UserEmailRepository } from "@/domain/repositories/user-email.repository";
import { AccesRepository } from "@/domain/repositories/acces.repository";
import { PrismaAccesRepository } from "../database/repositories/prisma-acces.repository";

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
    {
      provide: AbsenceRepository,
      useClass: PrismaAbsenceRepository,
    },
    {
      provide: CoffreRepository,
      useClass: PrismaCoffreRepository,
    },
    {
      provide: RestauRepository,
      useClass: PrismaRestauRepository,
    },
    {
      provide: NotificationRepository, // ✅ token
      useClass: PrismaNotificationRepository, // ✅ concrete class
    },
    {
      provide: UserEmailRepository,
      useClass: PrismaUserEmailRepository,
    },
    {
      provide: AccesRepository,
      useClass: PrismaAccesRepository,
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
    AbsenceRepository,
    CoffreRepository,
    RestauRepository,
    NotificationRepository,
    UserEmailRepository,
    AccesRepository,
  ],
})
export class DatabaseModule {}
