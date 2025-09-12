import { Inject, Injectable } from "@nestjs/common";
import { NotificationRepository } from "@/domain/repositories/notification.repository";

@Injectable()
export class DeleteNotificationUseCase {
  constructor(
    @Inject(NotificationRepository)
    private notificationRepository: NotificationRepository
  ) {}

  async execute(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }
}
