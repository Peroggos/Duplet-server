import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get(':id')
  getIdUserMatch(match_id: string, @Req() req) {
    return this.matchesService.getIdUserMatch(match_id, req.user.id)
  }

}
