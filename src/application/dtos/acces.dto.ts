import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUUID,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateAccesDto {
  @ApiProperty({
    description: "ID of the user associated with this access",
    example: "1b70cefe-a1b7-4a90-b930-0de911946f98",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "Status of the access (e.g., active, disabled, pending)",
    example: "active",
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: "Product code associated with this access",
    example: "MS365",
  })
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiPropertyOptional({
    description:
      "Password for the access (optional, will be encrypted if provided)",
    example: "AZhk1234$",
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: "Email associated with this access (optional)",
    example: "j.doe@finanssor.fr",
  })
  @IsString()
  @IsOptional()
  email?: string;
}

export class CreateWinleadUserDto {
  @ApiProperty({ example: "John", description: "First name of the user" })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: "Doe", description: "Last name of the user" })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: "j.doe@example.com",
    description: "User email",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "0612345678", description: "Phone number" })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: "john.doe", description: "Login/username" })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: "JD", description: "Signature" })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ example: "Conseiller", description: "Role in Winlead" })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    example: "1b70cefe-a1b7-4a90-b930-0de911946f98",
    description: "Internal user ID",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class ResetWinleadPasswordDto {
  @ApiProperty({ example: "internal-user-id", description: "Internal user ID" })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: "lilian.dupont@example.com",
    description: "Email in Winlead",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: "nouveauMdp2025",
    description: "New password to set",
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class DeleteWinleadByAccesDto {
  @IsUUID()
  accesId: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export class UpdateAccesDto {
  @ApiPropertyOptional({
    description: "New password for the acces",
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  password?: string | null;

  @ApiPropertyOptional({
    description: "Email associated with the acces",
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({
    description: "Status of the acces",
    type: String,
    example: "online",
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: "Product code linked to the acces",
    type: String,
    example: "PROD-1234",
  })
  @IsOptional()
  @IsString()
  productCode?: string;
}

export class ResetAccesPasswordDto {
  @ApiProperty({
    example: "NewStrongPass123!",
    description: "New password to set for the acces account",
  })
  @IsString()
  newPassword: string;
}

export class DeleteWinleadUserDto {
  @ApiProperty({
    example: "usr_123456",
    description: "Local database user ID",
  })
  @IsString()
  @IsNotEmpty()
  userIdLocal: string;

  @ApiProperty({
    example: "johndoe@example.com",
    description: "Winlead email to delete",
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}
