import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRestauDto {
  @ApiProperty({ example: "cmcqkvo0000015x2ahuewe6bx" })
  @IsString()
  @IsNotEmpty()
  idUser: string;

  @ApiProperty({ example: "20" })
  @IsString()
  @IsNotEmpty()
  nbrJours: string;

  @ApiProperty({ example: "Janvier" })
  @IsString()
  @IsNotEmpty()
  mois: string;

  @ApiProperty({ example: "2025" })
  @IsString()
  @IsNotEmpty()
  annee: string;

  @ApiProperty({ example: "note", required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fichierJustificatifPdf?: string;
}

export class UpdateRestauDto {
  @ApiProperty({ example: "20", required: false })
  @IsString()
  @IsOptional()
  nbrJours?: string;

  @ApiProperty({ example: "Janvier", required: false })
  @IsString()
  @IsOptional()
  mois?: string;

  @ApiProperty({ example: "2025", required: false })
  @IsString()
  @IsOptional()
  annee?: string;

  @ApiProperty({ example: "note", required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fichierJustificatifPdf?: string;
}

export class RestauResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  idUser: string;

  @ApiProperty()
  nbrJours: string;

  @ApiProperty()
  mois: string;

  @ApiProperty()
  annee: string;

  @ApiProperty()
  note: string;

  @ApiProperty()
  fichierJustificatifPdf: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
