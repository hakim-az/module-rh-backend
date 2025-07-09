import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateNaissanceDto {
  @ApiProperty({ example: "cmcqkvo0000015x2ahuewe6bx" })
  @IsString()
  @IsNotEmpty()
  idUser: string;

  @ApiProperty({ example: "2000-01-01" })
  @IsDateString()
  @IsNotEmpty()
  dateDeNaissance: string;

  @ApiProperty({ example: "France" })
  @IsString()
  @IsNotEmpty()
  paysDeNaissance: string;

  @ApiProperty({ example: "Paris" })
  @IsString()
  @IsNotEmpty()
  departementDeNaissance: string;

  @ApiProperty({ example: "Paris" })
  @IsString()
  @IsNotEmpty()
  communeDeNaissance: string;

  @ApiProperty({ example: "France" })
  @IsString()
  @IsNotEmpty()
  paysDeNationalite: string;
}

export class UpdateNaissanceDto {
  @ApiProperty({ example: "2000-01-01", required: false })
  @IsDateString()
  @IsOptional()
  dateDeNaissance?: string;

  @ApiProperty({ example: "France", required: false })
  @IsString()
  @IsOptional()
  paysDeNaissance?: string;

  @ApiProperty({ example: "Paris", required: false })
  @IsString()
  @IsOptional()
  departementDeNaissance?: string;

  @ApiProperty({ example: "Paris", required: false })
  @IsString()
  @IsOptional()
  communeDeNaissance?: string;

  @ApiProperty({ example: "France", required: false })
  @IsString()
  @IsOptional()
  paysDeNationalite?: string;
}

export class NaissanceResponseDto {
  @ApiProperty()
  idUser: string;

  @ApiProperty()
  dateDeNaissance: string;

  @ApiProperty()
  paysDeNaissance: string;

  @ApiProperty()
  departementDeNaissance: string;

  @ApiProperty()
  communeDeNaissance: string;

  @ApiProperty()
  paysDeNationalite: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
