import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUrgenceDto {
  @ApiProperty({ example: "6478374", type: String })
  @IsString()
  @IsNotEmpty()
  idUser: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  @IsNotEmpty()
  nomComplet: string;

  @ApiProperty({ example: "Frère" })
  @IsString()
  @IsNotEmpty()
  lienAvecLeSalarie: string;

  @ApiProperty({ example: "33777777777" })
  @IsString()
  @IsNotEmpty()
  telephone: string;
}

export class UpdateUrgenceDto {
  @ApiProperty({ example: "John Doe", required: false })
  @IsString()
  @IsOptional()
  nomComplet?: string;

  @ApiProperty({ example: "Frère", required: false })
  @IsString()
  @IsOptional()
  lienAvecLeSalarie?: string;

  @ApiProperty({ example: "33777777777", required: false })
  @IsString()
  @IsOptional()
  telephone?: string;
}

export class UrgenceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  idUser: string;

  @ApiProperty()
  nomComplet: string;

  @ApiProperty()
  lienAvecLeSalarie: string;

  @ApiProperty()
  telephone: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
