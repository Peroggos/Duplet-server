
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from '../types/types.user';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    
  constructor(private readonly configService: ConfigService) {
    const jwtSecrit = configService.get('JWT_SECRET')
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecrit,
    });
  }

  async validate(user: IUser) {
    return { id: user.id, email: user.email };
  }
}
