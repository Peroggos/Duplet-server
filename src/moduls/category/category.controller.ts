import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';


@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    return this.categoryService.create(createCategoryDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.categoryService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.categoryService.findOne(id, req.user.id);
  }

  // ✅ ИСПРАВЛЕНО: правильное количество аргументов
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req,
  ) {
    return this.categoryService.update(id, updateCategoryDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.categoryService.remove(id, req.user.id);
  }

  // ✅ ИСПРАВЛЕНО: используем имя метода addUserToCategori
  @Post(':id/users/:userId')
  addUserToCategory(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.categoryService.addUserToCategori(id, userId);
  }
}