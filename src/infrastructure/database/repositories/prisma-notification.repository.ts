import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { NotificationRepository } from "@/domain/repositories/notification.repository";
import { Notification } from "@/domain/entities/notification.entity";

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    notification: Omit<Notification, "id" | "createdAt" | "updatedAt" | "user">
  ): Promise<Notification> {
    const created = await this.prisma.notification.create({
      data: {
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        read: notification.read,
      },
      include: {
        user: {
          select: {
            nomDeNaissance: true,
            prenom: true,
            emailProfessionnel: true,
            avatar: true,
          },
        },
      },
    });

    return new Notification({
      ...created,
      user: created.user,
    });
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            nomDeNaissance: true,
            prenom: true,
            emailProfessionnel: true,
            avatar: true,
          },
        },
      },
    });

    return notification
      ? new Notification({ ...notification, user: notification.user })
      : null;
  }

  async findByUserId(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            nomDeNaissance: true,
            prenom: true,
            emailProfessionnel: true,
            avatar: true,
          },
        },
      },
    });

    return notifications.map(
      (notification) =>
        new Notification({ ...notification, user: notification.user })
    );
  }

  async findAll(limit = 100, offset = 0): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            nomDeNaissance: true,
            prenom: true,
            emailProfessionnel: true,
            avatar: true,
          },
        },
      },
    });

    return notifications.map(
      (notification) =>
        new Notification({ ...notification, user: notification.user })
    );
  }

  async update(
    id: string,
    data: Partial<Omit<Notification, "user">>
  ): Promise<Notification> {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.message !== undefined) updateData.message = data.message;
    if (data.read !== undefined) updateData.read = data.read;
    if (data.userId !== undefined) updateData.userId = data.userId;

    const updated = await this.prisma.notification.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            nomDeNaissance: true,
            prenom: true,
            emailProfessionnel: true,
            avatar: true,
          },
        },
      },
    });

    return new Notification({ ...updated, user: updated.user });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async countByUserId(
    userId: string
  ): Promise<{ total: number; unread: number; read: number }> {
    const [total, unread] = await Promise.all([
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      total,
      unread,
      read: total - unread,
    };
  }

  async deleteOldNotifications(daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}
