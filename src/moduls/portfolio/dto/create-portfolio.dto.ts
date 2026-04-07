import { IsDefined, IsNumber, IsOptional, IsString, IsEnum, IsUUID, Min, } from "class-validator"
import { MediaType } from "../entities/portfolio.entity"

export class CreatePortfolioDto {

    @IsString()
    @IsDefined()
    title: string

    @IsString()
   @IsOptional()
    media_url?: string

    @IsEnum(MediaType)
    @IsString()
    @IsOptional()
    media_type?: MediaType

    @IsString()
    @IsOptional()
    description?: string

    @IsNumber()
    @Min(0)
   @IsOptional()
    order?: number
    

}
