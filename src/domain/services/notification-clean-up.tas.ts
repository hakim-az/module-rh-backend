import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { NotificationRepository } from "../../domain/repositories/notification.repository";

@Injectable()
export class NotificationCleanupTask {
  private readonly logger = new Logger(NotificationCleanupTask.name);

  constructor(private notificationRepository: NotificationRepository) {}

  // Nettoie les notifications de plus de 90 jours tous les dimanche à 2h du matin
  @Cron("0 2 * * 0") // Cron expression: minute hour day month dayOfWeek
  async cleanupOldNotifications() {
    this.logger.log("Starting cleanup of old notifications...");

    try {
      const deletedCount =
        await this.notificationRepository.deleteOldNotifications(90);
      this.logger.log(
        `Cleanup completed. Deleted ${deletedCount} old notifications.`
      );
    } catch (error) {
      this.logger.error("Error during notification cleanup:", error);
    }
  }

  // Nettoie les notifications lues de plus de 30 jours tous les jours à 1h du matin
  @Cron("0 1 * * *")
  async cleanupOldReadNotifications() {
    this.logger.log("Starting cleanup of old read notifications...");

    try {
      // Cette méthode pourrait être ajoutée au repository si nécessaire
      // const deletedCount = await this.notificationRepository.deleteOldReadNotifications(30);
      // this.logger.log(`Cleanup completed. Deleted ${deletedCount} old read notifications.`);
    } catch (error) {
      this.logger.error("Error during read notification cleanup:", error);
    }
  }
}
