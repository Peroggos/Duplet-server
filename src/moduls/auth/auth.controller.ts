import { Controller, Post, Get,UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
 
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Body() LoginDto: LoginDto) {
    return this.authService.login(LoginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req){
    return req.user
  }
  @Post('regiser')
  async regiser(@Body() createUserDto: CreateUserDto){
     return this.authService.regiser(createUserDto)
  }
 
}

