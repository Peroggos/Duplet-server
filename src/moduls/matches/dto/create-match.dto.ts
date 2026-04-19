// dto/create-match.dto.ts
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MatchStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  BLOCKED = 'blocked'
}

export class CreateMatchDto {
    @ApiProperty({ description: 'ID матча' })
    @IsUUID()
    id: string;

    @ApiProperty({ description: 'ID целевого пользователя' })
    @IsUUID()
    targetUserId: string;

    @ApiProperty({ description: 'ID первого пользователя' })
    @IsUUID()
    user_id_1: string;

    @ApiProperty({ description: 'ID второго пользователя' })
    @IsUUID()
    user_id_2: string;

    @ApiPropertyOptional({ description: 'Статус матча', enum: MatchStatus, default: MatchStatus.ACTIVE })
    @IsOptional()
    @IsEnum(MatchStatus)
    status?: MatchStatus;

    @ApiPropertyOptional({ description: 'Время последнего сообщения' })
    @IsOptional()
    lastMessageAt?: Date;
}