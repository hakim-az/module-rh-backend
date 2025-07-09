import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateJustificatifDto {
  @ApiProperty({ example: "cmcqkvo0000015x2ahuewe6bx" })
  @IsNotEmpty()
  @IsString()
  idUser: string;

  @ApiProperty({ example: "https://example.com/pdf" })
  @IsString()
  @IsNotEmpty()
  fichierCarteVitalePdf: string;

  @ApiProperty({ example: "https://example.com/pdf" })
  @IsString()
  @IsNotEmpty()
  fichierRibPdf: string;

  @ApiProperty({ example: "https://example.com/pdf" })
  @IsString()
  @IsNotEmpty()
  fichierPieceIdentitePdf: string;

  @ApiProperty({ example: "https://example.com/pdf" })
  @IsString()
  @IsNotEmpty()
  fichierJustificatifDomicilePdf: string;
}

export class UpdateJustificatifDto {
  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsNotEmpty()
  fichierCarteVitalePdf?: string;

  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsNotEmpty()
  fichierRibPdf?: string;

  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsNotEmpty()
  fichierPieceIdentitePdf?: string;

  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsNotEmpty()
  fichierJustificatifDomicilePdf?: string;
}

export class JustificatifResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fichierCarteVitalePdf: string;

  @ApiProperty()
  fichierRibPdf: string;

  @ApiProperty()
  fichierPieceIdentitePdf: string;

  @ApiProperty()
  fichierJustificatifDomicilePdf: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
