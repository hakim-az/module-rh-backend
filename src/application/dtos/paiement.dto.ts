import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePaiementDto {
  @ApiProperty({ example: "cmcqkvo0000015x2ahuewe6bx" })
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

export class UpdatePeimentDto {
  @ApiProperty({ example: "FR1234567890", required: false })
  @IsString()
  @IsOptional()
  iban?: string;

  @ApiProperty({ example: "0987654321", required: false })
  @IsString()
  @IsOptional()
  bic?: string;
}

export class PeiementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  iban: string;

  @ApiProperty()
  bic: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
