import { Inject, Injectable } from "@nestjs/common";
import { NotificationRepository } from "@/domain/repositories/notification.repository";
import { Notification } from "@/domain/entities/notification.entity";

@Injectable()
export class GetAllNotificationsUseCase {
  constructor(
    @Inject(NotificationRepository)
    private notificationRepository: NotificationRepository
  ) {}

  async execute(limit?: number, offset?: number): Promise<Notification[]> {
    return await this.notificationRepository.findAll(limit, offset);
  }
}
