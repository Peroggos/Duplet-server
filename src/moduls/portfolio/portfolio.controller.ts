import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UsePipes, UseGuards, ValidationPipe } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';


@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  create(@Body() createPortfolioDto: CreatePortfolioDto, @Req() req) {
     const userId = req.user.user_id;
    return this.portfolioService.create(createPortfolioDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req) {
    return this.portfolioService.findAll(req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.portfolioService.findOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePortfolioDto: UpdatePortfolioDto, @Req() req) {
    return this.portfolioService.update(id, updatePortfolioDto, req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const user_id = req.user.id
    return this.portfolioService.remove(id, user_id);
  }
}
