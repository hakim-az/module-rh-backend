import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateJustificatifDto {
  @ApiProperty({ example: "cmcqkvo0000015x2ahuewe6bx" })
  @IsNotEmpty()
  @IsString()
  idUser: string;

  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsOptional()
  fichierCarteVitalePdf?: string;

  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsOptional()
  fichierRibPdf?: string;

  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsOptional()
  fichierPieceIdentitePdf?: string;

  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsOptional()
  fichierJustificatifDomicilePdf?: string;

  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsOptional()
  fichierAmeli?: string;
}

export class UpdateJustificatifDto {
  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsOptional()
  fichierCarteVitalePdf?: string;

  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsOptional()
  fichierRibPdf?: string;

  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsOptional()
  fichierPieceIdentitePdf?: string;

  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsOptional()
  fichierJustificatifDomicilePdf?: string;

  @ApiProperty({ example: "https://example.com/pdf", required: false })
  @IsString()
  @IsOptional()
  fichierAmeli?: string;
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
  fichierAmeli: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
