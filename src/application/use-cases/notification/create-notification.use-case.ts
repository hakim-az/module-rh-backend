import { Injectable, Inject } from "@nestjs/common";
import { NotificationRepository } from "@/domain/repositories/notification.repository";
import { UserRepository } from "@/domain/repositories/user.repository";
import { Notification } from "@/domain/entities/notification.entity";
import { CreateNotificationDto } from "../../dtos/notification.dto";

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject(NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    createNotificationDto: CreateNotificationDto
  ): Promise<Notification> {
    // 1️⃣ Verify that the user exists
    const user = await this.userRepository.findById(
      createNotificationDto.userId
    );
    if (!user) {
      throw new Error("User not found");
    }

    // 2️⃣ Create a Notification entity instance
    const notification = new Notification({
      userId: createNotificationDto.userId,
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      read: createNotificationDto.read ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: user,
    });

    // 3️⃣ Save the notification via repository
    return this.notificationRepository.create(notification);
  }
}
