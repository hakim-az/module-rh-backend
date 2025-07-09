import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateContratDto {
  @ApiProperty({ example: "Développeur full-stack" })
  @IsString()
  @IsNotEmpty()
  poste: string;

  @ApiProperty({ example: "Stage" })
  @IsString()
  @IsNotEmpty()
  typeContrat: string;

  @ApiProperty({ example: "2025-01-01" })
  @IsDateString()
  @IsNotEmpty()
  dateDebut: string;

  @ApiProperty({ example: "2026-01-01" })
  @IsDateString()
  @IsNotEmpty()
  dateFin: string;

  @ApiProperty({ example: "Etablissement de santé" })
  @IsString()
  @IsNotEmpty()
  etablissementDeSante: string;

  @ApiProperty({ example: "Service de santé" })
  @IsString()
  @IsNotEmpty()
  serviceDeSante: string;

  @ApiProperty({ example: "1100" })
  @IsString()
  @IsNotEmpty()
  salaire: string;

  @ApiProperty({ example: "FR1234567890" })
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fichierContratNonSignerPdf?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fichierContratSignerPdf?: string;
}

export class UpdateContratDto {
  @ApiProperty({ example: "Développeur full-stack", required: false })
  @IsString()
  @IsNotEmpty()
  poste?: string;

  @ApiProperty({ example: "Stage", required: false })
  @IsString()
  @IsNotEmpty()
  typeContrat?: string;

  @ApiProperty({ example: "2025-01-01", required: false })
  @IsDateString()
  @IsNotEmpty()
  dateDebut?: string;

  @ApiProperty({ example: "2026-01-01", required: false })
  @IsDateString()
  @IsNotEmpty()
  dateFin?: string;

  @ApiProperty({ example: "Etablissement de santé", required: false })
  @IsString()
  @IsNotEmpty()
  etablissementDeSante?: string;

  @ApiProperty({ example: "Service de santé", required: false })
  @IsString()
  @IsNotEmpty()
  serviceDeSante?: string;

  @ApiProperty({ example: "1100", required: false })
  @IsString()
  @IsNotEmpty()
  salaire?: string;

  @ApiProperty({ example: "FR1234567890", required: false })
  @IsString()
  @IsNotEmpty()
  matricule?: string;

  @ApiProperty({ example: "http://example.com", required: false })
  @IsString()
  @IsOptional()
  fichierContratNonSignerPdf?: string;

  @ApiProperty({ example: "http://example.com", required: false })
  @IsString()
  @IsOptional()
  fichierContratSignerPdf?: string;
}

export class ContratResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  poste: string;

  @ApiProperty()
  typeContrat: string;

  @ApiProperty()
  dateDebut: string;

  @ApiProperty()
  dateFin: string;

  @ApiProperty()
  etablissementDeSante: string;

  @ApiProperty()
  serviceDeSante: string;

  @ApiProperty()
  salaire: string;

  @ApiProperty()
  matricule: string;

  @ApiProperty()
  fichierContratNonSignerPdf: string;

  @ApiProperty()
  fichierContratSignerPdf: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
