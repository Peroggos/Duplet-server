import { IsArray, IsBoolean, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateConversationDto {
    @IsArray()
    @IsUUID('4', { each: true })
    participants: string[]

    @IsString()
    @IsOptional()
    name?: string

    @IsBoolean()
    @IsOptional()
    isGroup?: boolean
}
