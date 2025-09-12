import { IsString, IsBoolean, IsOptional } from "class-validator";

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsBoolean()
  @IsOptional()
  read?: boolean;
}

export class UpdateNotificationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsBoolean()
  @IsOptional()
  read?: boolean;
}

export class UserDto {
  @IsString()
  nomDeNaissance: string;

  @IsString()
  prenom: string;

  @IsString()
  emailProfessionnel: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class NotificationResponseDto {
  @IsString()
  id: string;

  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsBoolean()
  read: boolean;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;

  @IsOptional()
  user?: UserDto;
}

export class NotificationStatsDto {
  @IsBoolean()
  total: number;

  @IsBoolean()
  unread: number;

  @IsBoolean()
  read: number;
}
