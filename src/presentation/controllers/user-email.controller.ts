import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import {
  CreateUserEmailDto,
  ResetPasswordDto,
} from "@/application/dtos/user-mail.dto";
import { CreateUserEmailUseCase } from "@/application/use-cases/userEmail/create-user-email.use-case";
import { GetUserEmailUseCase } from "@/application/use-cases/userEmail/get-email.use-case";
import { GetAvailableLicensesUseCase } from "@/application/use-cases/userEmail/get-available-licenses.usecase";
import { ResetPasswordUseCase } from "@/application/use-cases/userEmail/reset-password.use-case";
import { DeleteUserEmailUseCase } from "@/application/use-cases/userEmail/delete-user-email.use-case";
import { Groups } from "@/application/auth/groups.decorator";
import { GroupsGuard } from "@/application/auth/groups.guard";
import { KeycloakAuthGuard } from "@/application/auth/keycloak-auth.guard";

@ApiTags("User Emails")
@ApiBearerAuth()
@Controller("user-emails")
@UseGuards(KeycloakAuthGuard)
export class UserEmailController {
  constructor(
    private readonly createUserEmailUseCase: CreateUserEmailUseCase,
    private readonly getUserEmailUseCase: GetUserEmailUseCase,
    private readonly getAvailableLicensesUseCase: GetAvailableLicensesUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly deleteUserEmailUseCase: DeleteUserEmailUseCase
  ) {}

  @Post()
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({ summary: "Create a professional email for a user" })
  @ApiBody({ type: CreateUserEmailDto })
  @ApiResponse({ status: 201, description: "Email created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(@Body() dto: CreateUserEmailDto) {
    return this.createUserEmailUseCase.execute(
      dto.userId,
      dto.licenseSku,
      dto.alias
    );
  }

  @Get("user/:userId")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({
    summary: "Get user email credentials (with decrypted password)",
  })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({
    status: 200,
    description: "Email credentials retrieved successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "1b70cefe-a1b7-4a90-b930-0de911946f98",
        upn: "j.doe@finanssor.fr",
        password: "Abc123!@#XyZ",
        displayName: "John Doe",
        alias: "john.doe",
        licenseSku: "ENTERPRISEPACK",
        createdAt: "2025-10-28T12:20:48.000Z",
        updatedAt: "2025-10-28T12:20:48.000Z",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Email account not found" })
  getUserEmail(@Param("userId") userId: string) {
    return this.getUserEmailUseCase.execute(userId);
  }

  @Get("licenses")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({
    summary: "Get all available Microsoft 365 licenses for the tenant",
  })
  @ApiResponse({
    status: 200,
    description: "Available licenses retrieved successfully",
    schema: {
      example: [
        {
          skuId: "6fd2c87f-b296-42f0-b197-1e91e994b900",
          skuPartNumber: "ENTERPRISEPACK",
          enabled: 25,
          consumed: 10,
        },
      ],
    },
  })
  async getAvailableLicenses() {
    return this.getAvailableLicensesUseCase.execute();
  }

  @Post("reset-password")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({ summary: "Reset a user's email password" })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: "Password reset successfully",
    schema: {
      example: {
        userId: "1b70cefe-a1b7-4a90-b930-0de911946f98",
        upn: "j.doe@finanssor.fr",
        message:
          "Password reset successfully in Microsoft 365 and local database",
        updatedAt: "2025-10-29T10:00:00.000Z",
      },
    },
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Email account not found" })
  async resetPassword(@Body() body: ResetPasswordDto) {
    const { userId, newPassword } = body;

    // Call the use case
    const result = await this.resetPasswordUseCase.execute(userId, newPassword);

    // Return consistent JSON with updatedAt timestamp
    return {
      userId,
      upn: result.upn,
      message: result.message,
      updatedAt: new Date().toISOString(),
    };
  }

  @Delete(":userId")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({ summary: "Delete a professional email for a user" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({
    status: 200,
    description: "User email deleted successfully",
    schema: {
      example: {
        upn: "j.doe@finanssor.fr",
        message: "User email deleted successfully",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Email account not found" })
  deleteUserEmail(@Param("userId") userId: string) {
    return this.deleteUserEmailUseCase.execute(userId);
  }
}
