import { IsNotEmpty, IsString } from "class-validator"
import { User } from "src/moduls/user/entities/user.entity"

export class CreateCategoryDto {

    @IsNotEmpty()
    @IsString()
    name: string

    @IsString()
    label: string

    icon?: string

    user?: User
}
