import { IsEnum, isEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { MessageType } from "../entities/massage.entity";


export class CreateMassageDto {
    @IsUUID()
    conversationId: string

    @IsString()
    content: string

    @IsEnum(MessageType)
    @IsOptional()
    type?: MessageType

    @IsString()
    @IsOptional()
    reployToId?: string
   
}
