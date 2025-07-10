import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateAbsenceDto {
  @ApiProperty({ example: "cmcqkvo0000015x2ahuewe6bx" })
  @IsString()
  @IsNotEmpty()
  idUser: string;

  @ApiProperty({ example: "Congé maladie" })
  @IsString()
  @IsNotEmpty()
  typeAbsence: string;

  @ApiProperty({ example: "2025-01-01" })
  @IsDateString()
  @IsNotEmpty()
  dateDebut: Date;

  @ApiProperty({ example: "2026-01-01" })
  @IsDateString()
  @IsNotEmpty()
  dateFin: Date;

  @ApiProperty({ example: "note", required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ example: "approuver", required: false })
  @IsString()
  @IsOptional()
  statut?: string;

  @ApiProperty({ example: "motif de refus", required: false })
  @IsString()
  @IsOptional()
  motifDeRefus?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fichierJustificatifPdf?: string;
}

export class UpdateAbsenceDto {
  @ApiProperty({ example: "Congé maladie", required: false })
  @IsString()
  @IsOptional()
  typeAbsence?: string;

  @ApiProperty({ example: "2025-01-01", required: false })
  @IsDateString()
  @IsOptional()
  dateDebut?: Date;

  @ApiProperty({ example: "2026-01-01", required: false })
  @IsDateString()
  @IsOptional()
  dateFin?: Date;

  @ApiProperty({ example: "note", required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ example: "approuver", required: false })
  @IsString()
  @IsOptional()
  statut?: string;

  @ApiProperty({ example: "motif de refus", required: false })
  @IsString()
  @IsOptional()
  motifDeRefus?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fichierJustificatifPdf?: string;
}

export class AbsenceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  idUser: string;

  @ApiProperty()
  typeAbsence: string;

  @ApiProperty()
  dateDebut: String;

  @ApiProperty()
  dateFin: String;

  @ApiProperty()
  note: string;

  @ApiProperty()
  statut: string;

  @ApiProperty()
  motifDeRefus: string;

  @ApiProperty()
  fichierJustificatifPdf: string;

  @ApiProperty()
  createdAt: String;

  @ApiProperty()
  updatedAt: String;
}
