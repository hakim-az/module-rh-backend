import { Module } from "@nestjs/common";
import { CreateNotificationUseCase } from "../use-cases/notification/create-notification.use-case";
import { GetNotificationUseCase } from "../use-cases/notification/get-notification.use-case";
import { GetNotificationsByUserUseCase } from "../use-cases/notification/get-notification-by-user.use-case";
import { GetAllNotificationsUseCase } from "../use-cases/notification/get-all-notifications.use-case";
import { UpdateNotificationUseCase } from "../use-cases/notification/update-notification.use-case";
import { DeleteNotificationUseCase } from "../use-cases/notification/delete-notification.use-case";
import { MarkNotificationAsReadUseCase } from "../use-cases/notification/mark-notification-as-read.use-case";
import { MarkAllNotificationsAsReadUseCase } from "../use-cases/notification/mark-all-notifications-as-read.use-case";
import { GetNotificationStatsUseCase } from "../use-cases/notification/get-notification-stats.use-case";
import { NotificationService } from "@/domain/services/notification.service";
import { DatabaseModule } from "@/infrastructure/modules/database.module";
import { NotificationsGateway } from "@/domain/services/notifications.gateway";

@Module({
  imports: [DatabaseModule],
  providers: [
    CreateNotificationUseCase,
    GetNotificationUseCase,
    GetNotificationsByUserUseCase,
    GetAllNotificationsUseCase,
    UpdateNotificationUseCase,
    DeleteNotificationUseCase,
    MarkNotificationAsReadUseCase,
    MarkAllNotificationsAsReadUseCase,
    GetNotificationStatsUseCase,
    NotificationService,
    NotificationsGateway,
  ],
  exports: [
    CreateNotificationUseCase,
    GetNotificationUseCase,
    GetNotificationsByUserUseCase,
    GetAllNotificationsUseCase,
    UpdateNotificationUseCase,
    DeleteNotificationUseCase,
    MarkNotificationAsReadUseCase,
    MarkAllNotificationsAsReadUseCase,
    GetNotificationStatsUseCase,
    NotificationService,
  ],
})
export class NotificationModule {}
