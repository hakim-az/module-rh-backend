import { Inject, Injectable } from "@nestjs/common";
import { NotificationRepository } from "@/domain/repositories/notification.repository";

@Injectable()
export class GetNotificationStatsUseCase {
  constructor(
    @Inject(NotificationRepository)
    private notificationRepository: NotificationRepository
  ) {}

  async execute(
    userId: string
  ): Promise<{ total: number; unread: number; read: number }> {
    return await this.notificationRepository.countByUserId(userId);
  }
}
