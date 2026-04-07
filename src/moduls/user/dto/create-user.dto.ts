import { IsEmail, MinLength } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    email: string

    @MinLength(6, {message: "Password muts ne more"})
    password: string


}
