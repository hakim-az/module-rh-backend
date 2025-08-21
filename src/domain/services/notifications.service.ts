import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { Notification } from "@prisma/client";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
  }): Promise<Notification> {
    return this.prisma.notification.create({ data });
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId },
      data: { read: true },
    });
  }
}
