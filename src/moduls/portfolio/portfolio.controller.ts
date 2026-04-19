import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UsePipes, UseGuards, ValidationPipe } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

 @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
 
  create(@Body() createPortfolioDto: CreatePortfolioDto, @Req() req) {
    return this.portfolioService.create(createPortfolioDto, req.user.id);
  }

  @Get()
  findAll(@Req() req) {
     const page = req.query.page ? parseInt(req.query.page) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    
    return this.portfolioService.findAll(req.user.id,{ page, limit});
  }
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.portfolioService.findOne(id, req.user.id);
  }
  @Patch(':id')
  @UsePipes(new ValidationPipe()) 
  update(@Param('id') id: string, @Body() updatePortfolioDto: UpdatePortfolioDto, @Req() req) {
    return this.portfolioService.update(id, updatePortfolioDto, req.user.id);
  }
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const user_id = req.user.id
    return this.portfolioService.remove(id, user_id);
  }
}
