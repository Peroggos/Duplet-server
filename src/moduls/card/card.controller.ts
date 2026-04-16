import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto, @Req() req) {
    return this.cardService.create(createCardDto, req.user.id);
  }

  @Get()
  findAll(@Req() req) {
    return this.cardService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.cardService.findOne(id, req.user.id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
  //   return this.cardService.update(+id, updateCardDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardService.remove(+id);
  }
}
