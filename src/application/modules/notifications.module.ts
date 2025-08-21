import { Module } from "@nestjs/common";
import { NotificationsService } from "@/domain/services/notifications.service";
import { NotificationsController } from "@/presentation/controllers/notification.controller";
import { PrismaService } from "@/infrastructure/database/prisma.service";

@Module({
  providers: [NotificationsService, PrismaService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
