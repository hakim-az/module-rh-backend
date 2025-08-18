import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAdresseDto {
  @ApiProperty({ example: "6478374", type: String })
  @IsString()
  @IsNotEmpty()
  idUser: string;

  @ApiProperty({ example: "France" })
  @IsString()
  @IsNotEmpty()
  pays: string;

  @ApiProperty({ example: "75000" })
  @IsString()
  @IsNotEmpty()
  codePostal: string;

  @ApiProperty({ example: "Paris" })
  @IsString()
  @IsNotEmpty()
  ville: string;

  @ApiProperty({ example: "test" })
  @IsString()
  @IsNotEmpty()
  adresse: string;

  @ApiProperty({ example: "test" })
  @IsString()
  @IsOptional()
  complementAdresse?: string;

  @ApiProperty({ example: "false", required: false })
  @IsString()
  @IsOptional()
  domiciliteHorsLaFrance?: string;
}

export class UpdateAdresseDto {
  @ApiProperty({ example: "France", required: false })
  @IsString()
  @IsOptional()
  pays?: string;

  @ApiProperty({ example: "75000", required: false })
  @IsString()
  @IsOptional()
  codePostal?: string;

  @ApiProperty({ example: "Paris", required: false })
  @IsString()
  @IsOptional()
  ville?: string;

  @ApiProperty({ example: "test", required: false })
  @IsString()
  @IsOptional()
  adresse?: string;

  @ApiProperty({ example: "test", required: false })
  @IsString()
  @IsOptional()
  complementAdresse?: string;

  @ApiProperty({ example: "false", required: false })
  @IsString()
  @IsOptional()
  domiciliteHorsLaFrance?: string;
}

export class AdresseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  idUser: string;

  @ApiProperty()
  pays: string;

  @ApiProperty()
  codePostal: string;

  @ApiProperty()
  ville: string;

  @ApiProperty()
  adresse: string;

  @ApiProperty()
  complementAdresse: string;

  @ApiProperty()
  domiciliteHorsLaFrance: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
