import { Injectable } from "@nestjs/common";
import { UserEmailRepository } from "@/domain/repositories/user-email.repository";
import { UserEmail } from "@/domain/entities/user-email.entity";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PrismaUserEmailRepository implements UserEmailRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEmail | null> {
    const record = await this.prisma.userEmail.findUnique({ where: { id } });
    if (!record) return null;
    return this.toEntity(record);
  }

  async findByUserId(userId: string): Promise<UserEmail | null> {
    const record = await this.prisma.userEmail.findUnique({
      where: { userId },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  async updatePassword(id: string, encryptedPassword: string): Promise<void> {
    await this.prisma.userEmail.update({
      where: { id },
      data: { password: encryptedPassword },
    });
  }

  async findByUpn(upn: string): Promise<UserEmail | null> {
    const record = await this.prisma.userEmail.findUnique({ where: { upn } });
    if (!record) return null;
    return this.toEntity(record);
  }

  async save(userEmail: UserEmail): Promise<UserEmail> {
    const data = {
      ...userEmail,
      createdAt: userEmail.createdAt || undefined,
      updatedAt: new Date(),
    };
    const record = await this.prisma.userEmail.upsert({
      where: { id: userEmail.id },
      update: data,
      create: data,
    });
    return this.toEntity(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userEmail.delete({ where: { id } });
  }

  private toEntity(record: any): UserEmail {
    return new UserEmail(
      record.id,
      record.userId,
      record.upn,
      record.password,
      record.displayName,
      record.alias,
      record.licenseSku,
      record.isEnabled,
      record.isDeleted,
      record.deletedAt,
      record.createdAt,
      record.updatedAt
    );
  }
}
