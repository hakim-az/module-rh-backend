import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Put,
  Delete,
  Patch,
  Param,
  NotFoundException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateAccesUseCase } from "@/application/use-cases/acces/create-acces.use-case";
import {
  CreateAccesDto,
  CreateWinleadUserDto,
  DeleteWinleadByAccesDto,
  DeleteWinleadUserDto,
  ResetAccesPasswordDto,
  ResetWinleadPasswordDto,
  UpdateAccesDto,
} from "@/application/dtos/acces.dto";
import { Acces } from "@/domain/entities/acces.entity";
import { CreateWinleadUserUseCase } from "@/application/use-cases/acces/winlead/create-winlead-user.use-case";
import { GetAccesPasswordUseCase } from "@/application/use-cases/acces/get-acces-password.use-case";
import { ResetWinleadPasswordUseCase } from "@/application/use-cases/acces/winlead/rest-winlead-password.use-case";
import { DeleteWinleadUserUseCase } from "@/application/use-cases/acces/winlead/delete-winlead-user.use-case";
import { UpdateAccesUseCase } from "@/application/use-cases/acces/update-acces.use-case";
import { DeleteAccesUseCase } from "@/application/use-cases/acces/delete-acces.use-case";
import { ResetAccesPasswordUseCase } from "@/application/use-cases/acces/reset-acces-password.use-case";
import { Groups } from "@/application/auth/groups.decorator";
import { GroupsGuard } from "@/application/auth/groups.guard";
import { KeycloakAuthGuard } from "@/application/auth/keycloak-auth.guard";

@ApiTags("Acces")
@ApiBearerAuth()
@Controller("acces")
@UseGuards(KeycloakAuthGuard)
export class AccesController {
  constructor(
    private readonly createAccesUseCase: CreateAccesUseCase,
    private readonly createWinleadUserUseCase: CreateWinleadUserUseCase,
    private readonly getAccesPasswordUseCase: GetAccesPasswordUseCase,
    private readonly resetWinleadPasswordUseCase: ResetWinleadPasswordUseCase,
    private readonly deleteWinleadUserUseCase: DeleteWinleadUserUseCase,
    private readonly updateAccesUseCase: UpdateAccesUseCase,
    private readonly resetPasswordUseCase: ResetAccesPasswordUseCase,
    private readonly deleteAccesUseCase: DeleteAccesUseCase
  ) {}

  @Get("retreive-plain-password")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({ summary: "Get decrypted password for a user's access" })
  @ApiQuery({ name: "userId", required: true, description: "Internal user ID" })
  @ApiQuery({
    name: "productCode",
    required: true,
    description: "Product code (e.g., WINLEAD)",
  })
  @ApiResponse({
    status: 200,
    description: "Returns the decrypted password",
    type: String,
  })
  @ApiResponse({ status: 404, description: "Access not found" })
  async getPassword(
    @Query("userId") userId: string,
    @Query("productCode") productCode: string
  ): Promise<{ password: string }> {
    const password = await this.getAccesPasswordUseCase.execute(
      userId,
      productCode
    );
    return { password };
  }

  @Post()
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({ summary: "Create a new Acces entry" })
  @ApiBody({ type: CreateAccesDto })
  @ApiResponse({
    status: 201,
    description: "Acces successfully created",
    type: Acces,
  })
  @ApiResponse({ status: 400, description: "Invalid input" })
  async create(@Body() dto: CreateAccesDto): Promise<Acces> {
    return this.createAccesUseCase.execute(dto);
  }

  @Post("create-account-winlead")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({ summary: "Create a user in Winlead and local Acces" })
  @ApiBody({ type: CreateWinleadUserDto })
  @ApiResponse({
    status: 201,
    description: "User successfully created in Winlead and local Acces",
    type: Acces,
  })
  @ApiResponse({ status: 400, description: "Invalid input or Winlead error" })
  async createWinlead(@Body() dto: CreateWinleadUserDto): Promise<Acces> {
    return this.createWinleadUserUseCase.execute({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      login: dto.login,
      signature: dto.signature,
      role: dto.role,
      userIdLocal: dto.userId,
    });
  }

  @Put("reset-password-winlead")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({ summary: "Reset password in Winlead and local DB" })
  @ApiBody({ type: ResetWinleadPasswordDto })
  @ApiResponse({
    status: 200,
    description: "Password successfully updated",
    type: Acces,
  })
  @ApiResponse({ status: 404, description: "Access not found" })
  async resetPasswordWinlead(
    @Body() dto: ResetWinleadPasswordDto
  ): Promise<Acces> {
    return this.resetWinleadPasswordUseCase.execute({
      userId: dto.userId,
      email: dto.email,
      newPassword: dto.newPassword,
    });
  }

  // ✅ SPECIFIC DELETE ROUTES MUST COME BEFORE PARAMETERIZED ROUTES
  @Delete("delete-account-winlead")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({ summary: "Delete a Winlead user" })
  @ApiBody({ type: DeleteWinleadUserDto })
  @ApiResponse({
    status: 200,
    description: "Winlead user deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "User does not have a WINLEAD access",
  })
  @ApiResponse({
    status: 500,
    description: "Failed to delete Winlead user",
  })
  async deleteUser(@Body() body: DeleteWinleadUserDto) {
    return await this.deleteWinleadUserUseCase.execute({
      userIdLocal: body.userIdLocal,
      email: body.email,
    });
  }

  // ✅ PARAMETERIZED ROUTES SHOULD BE LAST
  @Patch(":id")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({ summary: "Update an Acces by its ID" })
  @ApiParam({ name: "id", description: "Acces ID to update", type: String })
  @ApiBody({ type: UpdateAccesDto })
  @ApiResponse({
    status: 200,
    description: "Acces successfully updated",
    type: Acces,
  })
  @ApiResponse({ status: 404, description: "Acces not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAccesDto
  ): Promise<Acces> {
    const updatedAcces = await this.updateAccesUseCase.execute(id, dto);

    if (!updatedAcces) {
      throw new NotFoundException(`Acces with id ${id} not found`);
    }

    return updatedAcces;
  }

  @Patch(":accesId/reset-password")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({ summary: "Reset acces password by acces ID" })
  @ApiParam({
    name: "accesId",
    description: "ID of the acces to reset password for",
    type: String,
  })
  @ApiBody({ type: ResetAccesPasswordDto })
  @ApiResponse({ status: 200, description: "Password reset successfully" })
  @ApiResponse({ status: 404, description: "Acces not found" })
  async resetPassword(
    @Param("accesId") accesId: string,
    @Body() body: ResetAccesPasswordDto
  ) {
    return this.resetPasswordUseCase.execute(accesId, body.newPassword);
  }

  @Delete(":id")
  @UseGuards(GroupsGuard)
  @Groups("RH-Manager", "RH-Admin", "RH-Gestionnaire", "RH-Assistant")
  @ApiOperation({ summary: "Delete acces by ID" })
  @ApiParam({ name: "id", description: "Acces ID", type: String })
  @ApiResponse({ status: 204, description: "Acces deleted successfully" })
  @ApiResponse({ status: 404, description: "Acces not found" })
  async deleteAcces(@Param("id") accesId: string) {
    await this.deleteAccesUseCase.execute(accesId);
    return;
  }
}
