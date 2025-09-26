import { IsEmail, IsNotEmpty } from "class-validator";

export class CheckVerificationDto {
  @IsEmail({}, { message: "Veuillez fournir une adresse email valide" })
  @IsNotEmpty({ message: "L'adresse email est requise" })
  email: string;
}
