import { ApiProperty, PartialType } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  ValidateNested,
  IsBoolean,
  IsDateString,
  MinLength,
} from "class-validator";

import { Type } from "class-transformer";
import { CreateNaissanceDto, UpdateNaissanceDto } from "./naissance.dto";
import { CreateAdresseDto, UpdateAdresseDto } from "./adresse.dto";
import { CreatePaiementDto, UpdatePaiementDto } from "./paiement.dto";
import { CreateUrgenceDto, UpdateUrgenceDto } from "./urgence.dto";
import {
  CreateJustificatifDto,
  UpdateJustificatifDto,
} from "./justificatif.dto";
import { CreateContratDto, UpdateContratDto } from "./contrat.dto";

export class CreateUserDto {
  // Données utilisateur de base (obligatoires)
  @ApiProperty({ example: "employee" })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: "profile-completed" })
  @IsString()
  @IsNotEmpty()
  statut: string;

  @ApiProperty({ example: "M" })
  @IsString()
  @IsOptional()
  civilite?: string;

  @ApiProperty({ example: "Jean" })
  @IsString()
  @IsNotEmpty()
  prenom: string;

  @ApiProperty({ example: "Dupont" })
  @IsString()
  @IsNotEmpty()
  nomDeNaissance: string;

  @ApiProperty({ example: "Dupont" })
  @IsString()
  @IsOptional()
  nomUsuel?: string;

  @ApiProperty({ example: "Célibataire" })
  @IsString()
  @IsOptional()
  situationFamiliale?: string;

  @ApiProperty({ example: "9876543210" })
  @IsString()
  @IsOptional()
  numeroSecuriteSociale?: string;

  @ApiProperty({ example: "john.doe@example.com" })
  @IsEmail()
  @IsNotEmpty()
  emailPersonnel: string;

  @ApiProperty({ example: "john.doe@example.com" })
  @IsEmail()
  @IsOptional()
  emailProfessionnel?: string;

  @ApiProperty({ example: "0777777777" })
  @IsString()
  @IsNotEmpty()
  telephonePersonnel: string;

  @ApiProperty({ example: "0777777777" })
  @IsString()
  @IsOptional()
  telephoneProfessionnel?: string;

  @ApiProperty({ example: "https://avatar.com", required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ example: "12345678" })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  // Données associées (optionnelles)
  @ApiProperty({ required: false, type: CreateNaissanceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateNaissanceDto)
  naissance?: CreateNaissanceDto;

  @ApiProperty({ required: false, type: CreateAdresseDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAdresseDto)
  adresse?: CreateAdresseDto;

  @ApiProperty({ required: false, type: CreatePaiementDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePaiementDto)
  paiement?: CreatePaiementDto;

  @ApiProperty({ required: false, type: CreateUrgenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUrgenceDto)
  urgence?: CreateUrgenceDto;

  @ApiProperty({ required: false, type: CreateJustificatifDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateJustificatifDto)
  justificatif?: CreateJustificatifDto;

  @ApiProperty({ required: false, type: CreateContratDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateContratDto)
  contrat?: CreateContratDto;
}
export class UpdateUserDto {
  @ApiProperty({ example: "employee", required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ example: "profile-completed", required: false })
  @IsOptional()
  @IsString()
  statut?: string;

  @ApiProperty({ example: "M", required: false })
  @IsOptional()
  @IsString()
  civilite?: string;

  @ApiProperty({ example: "Jean", required: false })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiProperty({ example: "Dupont", required: false })
  @IsOptional()
  @IsString()
  nomDeNaissance?: string;

  @ApiProperty({ example: "Dupont", required: false })
  @IsOptional()
  @IsString()
  nomUsuel?: string;

  @ApiProperty({ example: "Célibataire", required: false })
  @IsOptional()
  @IsString()
  situationFamiliale?: string;

  @ApiProperty({ example: "9876543210", required: false })
  @IsOptional()
  @IsString()
  numeroSecuriteSociale?: string;

  @ApiProperty({ example: "john.doe@example.com", required: false })
  @IsOptional()
  @IsEmail()
  emailPersonnel?: string;

  @ApiProperty({ example: "john.doe@example.com", required: false })
  @IsOptional()
  @IsEmail()
  emailProfessionnel?: string;

  @ApiProperty({ example: "33777777777", required: false })
  @IsOptional()
  @IsString()
  telephonePersonnel?: string;

  @ApiProperty({ example: "33777777777", required: false })
  @IsOptional()
  @IsString()
  telephoneProfessionnel?: string;

  @ApiProperty({ example: "https://avatar.com", required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  // Données associées (optionnelles)
  @ApiProperty({ required: false, type: UpdateNaissanceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNaissanceDto)
  naissance?: UpdateNaissanceDto;

  @ApiProperty({ required: false, type: UpdateAdresseDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAdresseDto)
  adresse?: UpdateAdresseDto;

  @ApiProperty({ required: false, type: UpdatePaiementDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePaiementDto)
  paiement?: UpdatePaiementDto;

  @ApiProperty({ required: false, type: UpdateUrgenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUrgenceDto)
  urgence?: UpdateUrgenceDto;

  @ApiProperty({ required: false, type: UpdateJustificatifDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateJustificatifDto)
  justificatif?: UpdateJustificatifDto;

  @ApiProperty({ required: false, type: UpdateContratDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateContratDto)
  contrat?: UpdateContratDto;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  statut: string;

  @ApiProperty()
  civilite: string;

  @ApiProperty()
  prenom: string;

  @ApiProperty()
  nomDeNaissance: string;

  @ApiProperty()
  nomUsuel: string;

  @ApiProperty()
  situationFamiliale: string;

  @ApiProperty()
  numeroSecuriteSociale: string;

  @ApiProperty()
  emailPersonnel: string;

  @ApiProperty()
  emailProfessionnel: string;

  @ApiProperty()
  telephonePersonnel: string;

  @ApiProperty()
  telephoneProfessionnel: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
