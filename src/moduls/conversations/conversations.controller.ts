import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Request } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtAuthGuard } from 'src/moduls/auth/guard/jwt-auth.guard';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  create(@Body() createConversationDto: CreateConversationDto, @Request() req) {
    return this.conversationsService.createConversation(createConversationDto);
  }

  @Get()
  getConversationById(@Req() req, user: any) {
    return this.conversationsService.getUserConversation(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationsService.getConversationById(id);
  }

  @Post('private/:userId')
  createPrivateChat(
    @Req() req,
    user: any,
    @Param('userId') otherUserId: string,
  ) {
    return this.conversationsService.getOrCreatePrivateChat(req.user.id, otherUserId);
  }
}
