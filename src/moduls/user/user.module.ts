import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Category } from '../category/entities/category.entity';
import { Portfolio } from '../portfolio/entities/portfolio.entity';
import { Card } from '../card/entities/card.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,Category,Portfolio,Card]),
    JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET'),
            signOptions: {  expiresIn: '30d'},
          }),
          inject: [ConfigService]
        })],
  
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
