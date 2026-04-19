import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { User } from "src/moduls/user/entities/user.entity"

export class CreateCategoryDto {

    @IsNotEmpty()
    @IsString()
    name: string

    @IsString()
    label: string
    @IsString()
    @IsOptional()
    icon?: string

    
    user?: User
}
