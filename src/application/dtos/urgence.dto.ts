import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateUrgenceDto {
  @ApiProperty({ example: "cmcqkvo0000015x2ahuewe6bx" })
  @IsNotEmpty()
  @IsString()
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
  @IsNotEmpty()
  nomComplet?: string;

  @ApiProperty({ example: "Frère", required: false })
  @IsString()
  @IsNotEmpty()
  lienAvecLeSalarie?: string;

  @ApiProperty({ example: "33777777777", required: false })
  @IsString()
  @IsNotEmpty()
  telephone?: string;
}

export class UrgenceResponseDto {
  @ApiProperty()
  id: string;

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
