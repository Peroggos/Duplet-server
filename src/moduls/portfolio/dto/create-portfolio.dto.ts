import { IsDefined, IsNumber, IsOptional, IsString, IsEnum, IsUUID, Min, IsUrl, } from "class-validator"
import { MediaType } from "../entities/portfolio.entity"
import { Transform } from "class-transformer";

export class CreatePortfolioDto {

    @IsString()
    @IsDefined()
    title: string

    @IsUrl()
    @IsOptional()
    media_url?: string

    @IsOptional()
    @IsUrl({
    require_protocol: true,
    protocols: ['http', 'https'],
    }, { message: 'Invalid thumbnail URL' })
    @Transform(({ value }) => value?.trim())
    thumbnail_url?: string;

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
