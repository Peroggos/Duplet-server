import { Expose, Transform, Type } from "class-transformer";
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { CreateCategoryDto } from "src/moduls/category/dto/create-category.dto";
import { CreatePortfolioDto } from "src/moduls/portfolio/dto/create-portfolio.dto";

export class CreateUserDto {

    @IsEmail()
    email: string

    @IsString()
    username: string

    @MinLength(6, {message: "Password muts ne more"})
    password: string

    @IsString()
    @IsOptional()
    @MaxLength(500)
    bio?: string

    @IsString()
    @IsOptional()
    @MaxLength(50)
    name?: string

    @Expose()
    @Type(() => CreateCategoryDto)
    categories: CreateCategoryDto[]
    
    @Expose()
    @Type(() => CreatePortfolioDto)
    portfolio: CreatePortfolioDto[]

    @IsBoolean()
    onLine?: boolean
}

