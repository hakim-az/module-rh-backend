import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { KeycloakAuthGuard } from "../../application/auth/keycloak-auth.guard";
import { GroupsGuard } from "../../application/auth/groups.guard";
import { Groups } from "../../application/auth/groups.decorator";
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  NotificationResponseDto,
  NotificationStatsDto,
} from "../../application/dtos/notification.dto";
import { CreateNotificationUseCase } from "../../application/use-cases/notification/create-notification.use-case";
import { GetNotificationUseCase } from "../../application/use-cases/notification/get-notification.use-case";
import { GetNotificationsByUserUseCase } from "@/application/use-cases/notification/get-notification-by-user.use-case";
import { GetAllNotificationsUseCase } from "../../application/use-cases/notification/get-all-notifications.use-case";
import { UpdateNotificationUseCase } from "../../application/use-cases/notification/update-notification.use-case";
import { DeleteNotificationUseCase } from "../../application/use-cases/notification/delete-notification.use-case";
import { MarkNotificationAsReadUseCase } from "../../application/use-cases/notification/mark-notification-as-read.use-case";
import { MarkAllNotificationsAsReadUseCase } from "../../application/use-cases/notification/mark-all-notifications-as-read.use-case";
import { GetNotificationStatsUseCase } from "../../application/use-cases/notification/get-notification-stats.use-case";

@ApiTags("notifications")
@ApiBearerAuth()
@Controller("notifications")
@UseGuards(KeycloakAuthGuard)
export class NotificationController {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly getNotificationUseCase: GetNotificationUseCase,
    private readonly getNotificationsByUserUseCase: GetNotificationsByUserUseCase,
    private readonly getAllNotificationsUseCase: GetAllNotificationsUseCase,
    private readonly updateNotificationUseCase: UpdateNotificationUseCase,
    private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase,
    private readonly getNotificationStatsUseCase: GetNotificationStatsUseCase
  ) {}

  // GET ALL NOTIFICATIONS (Admin only)
  @Get()
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin")
  @ApiOperation({ summary: "Get all notifications (Admin only)" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: "Notifications retrieved successfully",
    type: [NotificationResponseDto],
  })
  async findAll(
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ): Promise<NotificationResponseDto[]> {
    try {
      const notifications = await this.getAllNotificationsUseCase.execute(
        limit ? parseInt(limit.toString()) : undefined,
        offset ? parseInt(offset.toString()) : undefined
      );

      return notifications.map((notification) => ({
        id: notification.id,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
        user: notification.user,
      }));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET NOTIFICATIONS BY USER
  @Get("user/:userId")
  @UseGuards(GroupsGuard)
  @Groups(
    "RH-Manager",
    "RH-Admin",
    "RH-Gestionnaire",
    "RH-Assistant",
    "Prospection-Admin",
    "Prospection-Commercial",
    "Prospection-Directeur",
    "Prospection-Gestionnaire",
    "Prospection-Manager",
    "Vente-Admin",
    "Vente-Commercial",
    "Vente-Manager"
  )
  @ApiOperation({ summary: "Get notifications by user ID" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: "User notifications retrieved successfully",
    type: [NotificationResponseDto],
  })
  async findByUser(
    @Param("userId") userId: string,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ): Promise<NotificationResponseDto[]> {
    try {
      const notifications = await this.getNotificationsByUserUseCase.execute(
        userId,
        limit ? parseInt(limit.toString()) : undefined,
        offset ? parseInt(offset.toString()) : undefined
      );

      return notifications.map((notification) => ({
        id: notification.id,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
        user: notification.user,
      }));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET NOTIFICATION STATS BY USER
  @Get("user/:userId/stats")
  @UseGuards(GroupsGuard)
  @Groups(
    "RH-Manager",
    "RH-Admin",
    "RH-Gestionnaire",
    "RH-Assistant",
    "Prospection-Admin",
    "Prospection-Commercial",
    "Prospection-Directeur",
    "Prospection-Gestionnaire",
    "Prospection-Manager",
    "Vente-Admin",
    "Vente-Commercial",
    "Vente-Manager"
  )
  @ApiOperation({ summary: "Get notification statistics for a user" })
  @ApiResponse({
    status: 200,
    description: "Notification stats retrieved successfully",
    type: NotificationStatsDto,
  })
  async getStatsForUser(
    @Param("userId") userId: string
  ): Promise<NotificationStatsDto> {
    try {
      return await this.getNotificationStatsUseCase.execute(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // GET NOTIFICATION BY ID
  @Get(":id")
  @UseGuards(GroupsGuard)
  @Groups(
    "RH-Manager",
    "RH-Admin",
    "RH-Gestionnaire",
    "RH-Assistant",
    "Prospection-Admin",
    "Prospection-Commercial",
    "Prospection-Directeur",
    "Prospection-Gestionnaire",
    "Prospection-Manager",
    "Vente-Admin",
    "Vente-Commercial",
    "Vente-Manager"
  )
  @ApiOperation({ summary: "Get a notification by ID" })
  @ApiResponse({
    status: 200,
    description: "Notification retrieved successfully",
    type: NotificationResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<NotificationResponseDto> {
    try {
      const notification = await this.getNotificationUseCase.execute(id);

      if (!notification) {
        throw new HttpException("Notification not found", HttpStatus.NOT_FOUND);
      }

      return {
        id: notification.id,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
        user: notification.user,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // CREATE NOTIFICATION
  @Post()
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({ summary: "Create a new notification" })
  @ApiResponse({
    status: 201,
    description: "Notification created successfully",
    type: NotificationResponseDto,
  })
  async create(
    @Body() createNotificationDto: CreateNotificationDto
  ): Promise<NotificationResponseDto> {
    try {
      const notification = await this.createNotificationUseCase.execute(
        createNotificationDto
      );

      return {
        id: notification.id,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
        user: notification.user,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // UPDATE NOTIFICATION
  @Patch(":id")
  @UseGuards(GroupsGuard)
  @Groups(
    "RH-Manager",
    "RH-Admin",
    "RH-Gestionnaire",
    "RH-Assistant",
    "Prospection-Admin",
    "Prospection-Commercial",
    "Prospection-Directeur",
    "Prospection-Gestionnaire",
    "Prospection-Manager",
    "Vente-Admin",
    "Vente-Commercial",
    "Vente-Manager"
  )
  @ApiOperation({ summary: "Update a notification" })
  @ApiResponse({
    status: 200,
    description: "Notification updated successfully",
    type: NotificationResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateNotificationDto: UpdateNotificationDto
  ): Promise<NotificationResponseDto> {
    try {
      const notification = await this.updateNotificationUseCase.execute(
        id,
        updateNotificationDto
      );

      return {
        id: notification.id,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
        user: notification.user,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // MARK NOTIFICATION AS READ
  @Patch(":id/read")
  @UseGuards(GroupsGuard)
  @Groups(
    "RH-Manager",
    "RH-Admin",
    "RH-Gestionnaire",
    "RH-Assistant",
    "Prospection-Admin",
    "Prospection-Commercial",
    "Prospection-Directeur",
    "Prospection-Gestionnaire",
    "Prospection-Manager",
    "Vente-Admin",
    "Vente-Commercial",
    "Vente-Manager"
  )
  @ApiOperation({ summary: "Mark a notification as read" })
  @ApiResponse({
    status: 200,
    description: "Notification marked as read",
    type: NotificationResponseDto,
  })
  async markAsRead(@Param("id") id: string): Promise<NotificationResponseDto> {
    try {
      const notification = await this.markNotificationAsReadUseCase.execute(id);

      return {
        id: notification.id,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
        user: notification.user,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // MARK ALL NOTIFICATIONS AS READ FOR USER
  @Patch("user/:userId/read-all")
  @UseGuards(GroupsGuard)
  @Groups(
    "RH-Manager",
    "RH-Admin",
    "RH-Gestionnaire",
    "RH-Assistant",
    "Prospection-Admin",
    "Prospection-Commercial",
    "Prospection-Directeur",
    "Prospection-Gestionnaire",
    "Prospection-Manager",
    "Vente-Admin",
    "Vente-Commercial",
    "Vente-Manager"
  )
  @ApiOperation({ summary: "Mark all notifications as read for a user" })
  @ApiResponse({
    status: 200,
    description: "All notifications marked as read",
  })
  async markAllAsRead(
    @Param("userId") userId: string
  ): Promise<{ message: string }> {
    try {
      await this.markAllNotificationsAsReadUseCase.execute(userId);
      return { message: "All notifications marked as read successfully" };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // DELETE NOTIFICATION
  @Delete(":id")
  @UseGuards(GroupsGuard)
  @Groups(
    "RH-Manager",
    "RH-Admin",
    "RH-Gestionnaire",
    "RH-Assistant",
    "Prospection-Admin",
    "Prospection-Commercial",
    "Prospection-Directeur",
    "Prospection-Gestionnaire",
    "Prospection-Manager",
    "Vente-Admin",
    "Vente-Commercial",
    "Vente-Manager"
  )
  @ApiOperation({ summary: "Delete a notification" })
  @ApiResponse({
    status: 200,
    description: "Notification deleted successfully",
  })
  async remove(@Param("id") id: string): Promise<{ message: string }> {
    try {
      await this.deleteNotificationUseCase.execute(id);
      return { message: "Notification deleted successfully" };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
