import { Inject, Injectable } from "@nestjs/common";
import { NotificationRepository } from "@/domain/repositories/notification.repository";
import { Notification } from "@/domain/entities/notification.entity";

@Injectable()
export class MarkNotificationAsReadUseCase {
  constructor(
    @Inject(NotificationRepository)
    private notificationRepository: NotificationRepository
  ) {}

  async execute(id: string): Promise<Notification> {
    return await this.notificationRepository.markAsRead(id);
  }
}
