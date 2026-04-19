// user.controller.ts
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
  Put,
  Query
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from '../auth/dto/auth.dto';

import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ✅ Получение профиля текущего пользователя
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return this.userService.findById(req.user.id);
  }

  // ✅ Получение пользователя по ID
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  // ✅ Получение пользователя по email
  @Get('email/:email')
  @ApiOperation({ summary: 'Get user by email' })
  async findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  // ✅ Обновление профиля
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateProfilee(req.user.id, updateUserDto);
  }

  // ✅ Смена пароля
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(req.user.id, changePasswordDto);
  }

  // ✅ Добавление элемента в портфолио
  @Post('portfolio')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add portfolio item' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mediaUrl: { type: 'string', example: 'https://example.com/image.jpg' },
        title: { type: 'string', example: 'My Project' }
      }
    }
  })
  async addPortfolioItem(
    @Request() req,
    @Body() data: { mediaUrl: string; title?: string }
  ) {
    return this.userService.addPortfolioItem(req.user.id, data);
  }

  // ✅ Получение портфолио пользователя
  @Get('portfolio')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user portfolio' })
  async getPortfolio(@Request() req) {
    return this.userService.getPortfolio(req.user.id);
  }

  // ✅ Удаление элемента портфолио
  @Delete('portfolio/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete portfolio item' })
  async deletePortfolioItem(@Request() req, @Param('itemId') itemId: string) {
    return this.userService.deletePortfolio(req.user.id, itemId);
  }

  // ✅ Обновление онлайн статуса
  @Patch('online-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user online status' })
  async updateOnlineStatus(
    @Request() req,
    @Body('isOnline') isOnline: boolean
  ) {
    return this.userService.updateOnlineStatus(req.user.id, isOnline);
  }

  // ✅ Создание категории
  @Post('categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category' })
  async createCategory(
    @Body('name') name: string,
    @Body('icon') icon?: string
  ) {
    return this.userService.createCategory(name, icon);
  }

  // ✅ Получение всех категорий
  @Get('categories/all')
  @ApiOperation({ summary: 'Get all categories' })
  async getAllCategories() {
    // Если нужно получить все категории, добавьте метод в сервис
    // return this.userService.findAllCategories();
  }
}