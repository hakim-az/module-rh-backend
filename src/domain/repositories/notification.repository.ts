import { Notification } from "../entities/notification.entity";

export const NotificationRepository = Symbol("NotificationRepository");

export interface NotificationRepository {
  create(
    notification: Omit<Notification, "id" | "createdAt" | "updatedAt" | "user">
  ): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<Notification[]>;
  findAll(limit?: number, offset?: number): Promise<Notification[]>;
  update(
    id: string,
    data: Partial<Omit<Notification, "user">>
  ): Promise<Notification>;
  delete(id: string): Promise<void>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;
  countByUserId(
    userId: string
  ): Promise<{ total: number; unread: number; read: number }>;
  deleteOldNotifications(daysOld: number): Promise<number>;
}
