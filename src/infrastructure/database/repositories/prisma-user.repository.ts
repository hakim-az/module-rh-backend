import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { User } from "../../../domain/entities/user.entity";
import { PrismaService } from "../../database/prisma.service";
import { UpdateUserDto } from "@/application/dtos/user.dto";

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        naissance: true,
        adresse: true,
        contrat: true,
        paiement: true,
        urgence: true,
        justificatif: true,
      },
    });

    return user ? new User(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      include: {
        naissance: true,
        adresse: true,
        contrat: true,
        paiement: true,
        urgence: true,
        justificatif: true,
      },
    });

    return users.map((user) => new User(user));
  }

  async create(userData: Omit<User, "createdAt" | "updatedAt">): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        ...userData,
      },
      include: {
        naissance: true,
        adresse: true,
        contrat: true,
        paiement: true,
        urgence: true,
        justificatif: true,
      },
    });

    return new User(user);
  }

  async update(id: string, userData: UpdateUserDto): Promise<User | null> {
    // on construit un objet libre pour Prisma
    const filteredData: Record<string, any> = {};

    const allowedFields = [
      "role",
      "statut",
      "civilite",
      "prenom",
      "nomDeNaissance",
      "nomUsuel",
      "situationFamiliale",
      "numeroSecuriteSociale",
      "emailPersonnel",
      "emailProfessionnel",
      "telephonePersonnel",
      "telephoneProfessionnel",
      "avatar",
    ];

    for (const key of allowedFields) {
      if (userData[key] !== undefined) {
        filteredData[key] = userData[key];
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: filteredData,
      include: {
        naissance: true,
        adresse: true,
        paiement: true,
        urgence: true,
        justificatif: true,
        contrat: true,
      },
    });

    // ici on reconstruit l’entité immutable User
    return new User(user);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ emailPersonnel: email }, { emailProfessionnel: email }],
      },
      include: {
        naissance: true,
        adresse: true,
        contrat: true,
        paiement: true,
        urgence: true,
        justificatif: true,
      },
    });

    return user ? new User(user) : null;
  }
}
