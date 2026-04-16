import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/auth.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly usersService: UserService,
    private jwtService: JwtService
    ) {}

async validateUser(email: string, password: string): Promise<any> {
  // Находим пользователя
  const user = await this.usersService.findByAuth(email);
  
  // ✅ ПРОВЕРКА: если пользователь не найден
  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }
  
  // ✅ ПРОВЕРКА: если у пользователя нет пароля
  if (!user.password) {
    throw new UnauthorizedException('Invalid email or password');
  }
  
  // Проверяем пароль
  const isPasswordValid = await argon2.verify(user.password, password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid email or password');
  }
  
  // Возвращаем пользователя без пароля
  const { password: _, ...result } = user;
  return result;
}

async regiser(createUserDto: CreateUserDto) {
    const { email, password, username} = createUserDto;
    const existingUser = await this.userRepository.findOne({
      where: { email }
    })

    if (existingUser) {
    throw new ConflictException('User with this email already exists');
    }

    const heshPassword = await argon2.hash(password)

      const user = await this.userRepository.create({
        email,
        password: heshPassword,
        username,
      })
      await this.userRepository.save(user)
      

      const tokens = this.generateTokens(user)

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.username,
          avatar: user.avatar,
        }

        
      }
  }


  // auth.service.ts - САМЫЙ ПРОСТОЙ И НАДЕЖНЫЙ ВАРИАНТ
// auth.service.ts - QueryBuilder без ошибок
async login(loginDto: LoginDto) {
  const { password, email } = loginDto;
  
  // ✅ Правильный QueryBuilder
  const user = await this.userRepository
    .createQueryBuilder('user')
    .where('user.email = :email', { email })
    .addSelect('user.password')
    .getOne();
  
  console.log('User found:', !!user);
  
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }
  
  if (!user.password) {
    throw new UnauthorizedException('Invalid credentials');
  }
  
  const isPasswordValid = await argon2.verify(user.password, password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }
  
  await this.userRepository.update(user.id, { lastLoginAt: new Date() });
  
  const tokens = this.generateTokens(user);
  
  const { password: _, ...result } = user;
  
  return {
    ...tokens,
    user: result
  };
}

 
private generateTokens(user: User) {
  const payload = { 
    sub: user.id, 
    email: user.email 
  };
  
  const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
  const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
  
  return { 
    access_token: accessToken,
    refresh_token: refreshToken 
  };
}
  }