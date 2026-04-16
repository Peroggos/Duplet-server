// src/auth/guard/ws-jwt.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    
    // Получаем токен из handshake
    const token = 
      client.handshake.auth?.token || 
      client.handshake.query?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      client.emit('error', { message: 'No token provided' });
      client.disconnect();
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      // Сохраняем пользователя в данных сокета
      client.data.user = payload;
      return true;
    } catch (error) {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
      return false;
    }
  }
}