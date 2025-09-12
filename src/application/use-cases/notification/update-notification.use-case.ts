import { Inject, Injectable } from "@nestjs/common";
import { NotificationRepository } from "../../../domain/repositories/notification.repository";
import { Notification } from "../../../domain/entities/notification.entity";
import { UpdateNotificationDto } from "../../dtos/notification.dto";

@Injectable()
export class UpdateNotificationUseCase {
  constructor(
    @Inject(NotificationRepository)
    private notificationRepository: NotificationRepository
  ) {}

  async execute(
    id: string,
    updateNotificationDto: UpdateNotificationDto
  ): Promise<Notification> {
    return await this.notificationRepository.update(id, updateNotificationDto);
  }
}
