import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { MassagesService } from './massages.service';
import { CreateMassageDto } from './dto/create-massage.dto';
import { UpdateMassageDto } from './dto/update-massage.dto';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from 'src/moduls/conversations/conversations.service';
import { UserService } from 'src/moduls/user/user.service';
import { error } from 'console';




@WebSocketGateway({
  cors: { origin: '*', creadentials: true},
  namespace: 'messages',
})
  export class MassagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedUsers = new Map<string, string>();
  
    constructor(
    private readonly massagesService: MassagesService,
    private readonly conversationsService: ConversationsService,
    private readonly userServise: UserService,
  ) {}

  async handleConnection(client: Socket) {
      const userId = client.handshake.auth.userId

      if(!userId){
        client.disconnect
        return;
      }
      this.connectedUsers.set(userId, client.id)
      const conversations = await this.conversationsService.getUserConversation(userId);
      conversations.forEach(conv => {
        client.join(`conv: ${conv.id}`)
      })
  }
  handleDisconnection(client: Socket){
    let disconnectUserId: string | null = null

    for(const [userId, socketId] of this.connectedUsers.entries()){
      if(socketId == client.id){
        disconnectUserId = userId
        break;
      }
      if(disconnectUserId) {
        this.connectedUsers.delete(disconnectUserId);
        console.log(`user ${disconnectUserId} it is disconnect`)
        this.server.emit('user:offline', {userId: disconnectUserId})
      }
    }
  }
  getUserIdBySocket(socketID: string): string | null {
    for(const [userId, socketId] of this.connectedUsers.entries()){
      if(userId === socketId) return userId;
    }
    return null;
  }
  @SubscribeMessage('massage:send')
  @WebSocketServer()
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string; content: string}) {
    const userId = this.getUserIdBySocket(client.id)
    if(!userId) return {success: false, error: "Not auht"}
    try {
      const massage = await this.massagesService.createMassage(userId, data)

      this.server.to(`conv ${data.conversationId}`).emit('massage:new',massage)
    } catch (error) {
      return { success: false, error: error.massage}
    }
  }
  /*TODO
  @SubscribeMessage('findAllMassages')
  findAll() {
    return this.massagesService.findAll();
  }

  @SubscribeMessage('findOneMassage')
  findOne(@MessageBody() id: string) {
    return this.massagesService.findOne(id);
  }

  @SubscribeMessage('updateMassage')
  update(@MessageBody() updateMassageDto: UpdateMassageDto) {
    return this.massagesService.update(updateMassageDto.id, updateMassageDto);
  }

  @SubscribeMessage('removeMassage')
  remove(@MessageBody() id: number) {
    return this.massagesService.remove(id);
  }
  */
}
