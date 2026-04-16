import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'messages',
})
export class MassagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    console.log(`🔌 New connection attempt: ${client.id}`);
    
    // Получаем userId из handshake
    const userId = client.handshake.auth.userId;
    
    if (!userId) {
      console.log(`❌ Client ${client.id} rejected: no userId`);
      client.emit('error', { message: 'No userId provided' });
      client.disconnect();
      return;
    }

    // Сохраняем пользователя
    this.connectedUsers.set(userId, client.id);
    console.log(`✅ User ${userId} connected with socket ${client.id}`);
    console.log(`📊 Online users: ${Array.from(this.connectedUsers.keys()).join(', ')}`);
    
    // Отправляем подтверждение подключения (НЕ отключаем клиента!)
    client.emit('connected', { 
      success: true,
      userId: userId,
      socketId: client.id
    });
    
    // Уведомляем всех остальных пользователей о новом онлайн пользователе
    client.broadcast.emit('user:online', { 
      userId: userId,
      isOnline: true 
    });
  }

  handleDisconnect(client: Socket) {
    let disconnectedUserId: string | null = null;
    
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    
    if (disconnectedUserId) {
      this.connectedUsers.delete(disconnectedUserId);
      console.log(`❌ User ${disconnectedUserId} disconnected`);
      console.log(`📊 Online users: ${Array.from(this.connectedUsers.keys()).join(', ')}`);
      
      // Уведомляем всех о выходе пользователя
      this.server.emit('user:offline', { 
        userId: disconnectedUserId,
        isOnline: false 
      });
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string }
  ) {
    const userId = this.getUserIdBySocket(client.id);
    
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    console.log(`📨 Message from ${userId} in ${data.conversationId}: ${data.content}`);

    const message = {
      id: Date.now().toString(),
      content: data.content,
      senderId: userId,
      conversationId: data.conversationId,
      createdAt: new Date(),
      status: 'sent'
    };

    // Отправляем всем в комнате
    this.server.to(`conv:${data.conversationId}`).emit('message:new', message);

    return { success: true, message };
  }

  @SubscribeMessage('message:read')
  handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageIds: string[]; conversationId: string }
  ) {
    const userId = this.getUserIdBySocket(client.id);
    if (!userId) return;

    console.log(`👁️ User ${userId} read messages: ${data.messageIds.join(', ')}`);
    
    this.server.to(`conv:${data.conversationId}`).emit('message:read', {
      messageIds: data.messageIds,
      userId: userId,
      readAt: new Date()
    });
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    const userId = this.getUserIdBySocket(client.id);
    if (!userId) return;

    client.broadcast.to(`conv:${data.conversationId}`).emit('typing:start', {
      userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    const userId = this.getUserIdBySocket(client.id);
    if (!userId) return;

    client.broadcast.to(`conv:${data.conversationId}`).emit('typing:stop', {
      userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('conversation:join')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    const userId = this.getUserIdBySocket(client.id);
    if (!userId) return { success: false, error: 'Not authenticated' };

    client.join(`conv:${data.conversationId}`);
    console.log(`User ${userId} joined conversation ${data.conversationId}`);
    
    return { success: true, message: 'Joined conversation' };
  }

  @SubscribeMessage('conversation:leave')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    const userId = this.getUserIdBySocket(client.id);
    if (!userId) return { success: false, error: 'Not authenticated' };

    client.leave(`conv:${data.conversationId}`);
    console.log(`User ${userId} left conversation ${data.conversationId}`);
    
    return { success: true, message: 'Left conversation' };
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    const userId = this.getUserIdBySocket(client.id);
    client.emit('pong', { timestamp: new Date(), userId });
  }

  private getUserIdBySocket(socketId: string): string | null {
    for (const [userId, id] of this.connectedUsers.entries()) {
      if (id === socketId) return userId;
    }
    return null;
  }
}