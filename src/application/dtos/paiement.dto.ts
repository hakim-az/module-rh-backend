import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePaiementDto {
  @ApiProperty({ example: "6478374", type: String })
  @IsString()
  @IsNotEmpty()
  idUser: string;

  @ApiProperty({ example: "FR1234567890" })
  @IsString()
  @IsNotEmpty()
  iban: string;

  @ApiProperty({ example: "0987654321" })
  @IsString()
  @IsNotEmpty()
  bic: string;
}

export class UpdatePaiementDto {
  @ApiProperty({ example: "FR1234567890", required: false })
  @IsString()
  @IsOptional()
  iban?: string;

  @ApiProperty({ example: "0987654321", required: false })
  @IsString()
  @IsOptional()
  bic?: string;
}

export class PaiementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  idUser: string;

  @ApiProperty()
  iban: string;

  @ApiProperty()
  bic: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
