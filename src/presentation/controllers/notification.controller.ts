import { Controller, Get, Post, Param, Body, Patch } from "@nestjs/common";
import { NotificationsService } from "@/domain/services/notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post()
  create(@Body() data: { userId: string; title: string; message: string }) {
    return this.notificationsService.createNotification(data);
  }

  @Get(":userId")
  getUserNotifications(@Param("userId") userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @Patch(":id/read")
  markAsRead(@Param("id") id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
