import { Inject, Injectable } from "@nestjs/common";
import { NotificationRepository } from "@/domain/repositories/notification.repository";

@Injectable()
export class MarkAllNotificationsAsReadUseCase {
  constructor(
    @Inject(NotificationRepository)
    private notificationRepository: NotificationRepository
  ) {}

  async execute(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}
