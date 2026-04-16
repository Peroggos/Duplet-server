
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from '../types/types.user';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/moduls/user/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
constructor(
private readonly configService: ConfigService,
@InjectRepository(User)
private readonly userRepository: Repository<User>
) {
    const jwtSecrit = configService.get('JWT_SECRET')
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecrit,
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({
      where: {id: payload.sub},
    })
    if(!user){
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.username,
      avatar: user.avatar
    }
  } 
}
