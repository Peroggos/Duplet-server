import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt';
import { IUser } from './types/types.user';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private jwtService: JwtService
    ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOne(email);
    
    const passIsMatch = await argon2.verify(user!.password, password)
    
    if (user && passIsMatch) {
      return user;
    }
    throw new UnauthorizedException('User or password are incorrect');
  }
  async login(user: IUser) {
   const {id, email} = user
    return {
        id, email, token: this.jwtService.sign({    id: user.id, email: user.email})
    }
}

}