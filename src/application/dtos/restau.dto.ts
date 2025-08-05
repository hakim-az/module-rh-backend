import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRestauDto {
  @ApiProperty({ example: 1, type: Number })
  @IsInt()
  @IsNotEmpty()
  idUser: number;

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

class UserResponse {
  @ApiProperty()
  prenom: string;

  @ApiProperty()
  nomDeNaissance: string;

  @ApiProperty()
  emailProfessionnel: string;

  @ApiProperty()
  avatar: string;
}

export class RestauResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  idUser: number;

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

  @ApiProperty()
  user: UserResponse;
}
