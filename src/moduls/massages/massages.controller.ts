import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MassagesService } from './massages.service';
import { CreateMassageDto } from './dto/create-massage.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';


@Controller('massages')
@UseGuards(JwtAuthGuard)
export class MassagesController {
    constructor(private massagesService: MassagesService) {}
    @Post()
    create(@Req() req, @Body() createMassageDto: CreateMassageDto){
        return this.massagesService.createMassage(req.user.id, createMassageDto)
    }
    @Get('conversation/:conversationId')
    getConversationMassages(@Param('conversationId') 
        conversationId: string,
        @Query('limit') limit?: number, 
        @Query('offset') offset?: number)
    {
    return this.massagesService.getConversationsMassage(
        conversationId,
        limit ? +limit : 50,
        offset ? +offset: 0
    )
    }
    @Post('read')
    readMassages(@Body() body: {massageIds: string[]}, @Req() req) {
        return this.massagesService.markAsRead(
            body.massageIds,
            req.user.id
        )
    }
    @Delete(':id')
    delete(@Param('id') massage_id: string, @Req() req) {
        return this.massagesService.deleteMassage(
            massage_id,
            req.user.id
        )
    }
}
