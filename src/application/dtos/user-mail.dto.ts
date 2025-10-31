import { IsString, IsOptional, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserEmailDto {
  @ApiProperty({
    description: "The ID of the user to create the professional email for",
    example: "1b70cefe-a1b7-4a90-b930-0de911946f98",
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: "Optional license SKU to assign to the email",
    example: "4b9405b0-7788-4568-add1-99614e613b69",
  })
  @IsOptional()
  @IsString()
  licenseSku?: string;

  @ApiPropertyOptional({
    description: "Optional alias for the email",
    example: "john.doe",
  })
  @IsOptional()
  @IsString()
  alias?: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: "The ID of the user whose email password will be reset",
    example: "1b70cefe-a1b7-4a90-b930-0de911946f98",
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: "The new password for the email account",
    example: "StrongP@ssw0rd123!",
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  newPassword: string;
}
