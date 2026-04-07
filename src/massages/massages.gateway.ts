import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { MassagesService } from './massages.service';
import { CreateMassageDto } from './dto/create-massage.dto';
import { UpdateMassageDto } from './dto/update-massage.dto';
import { Server } from 'socket.io';
import { ConversationsService } from 'src/conversations/conversations.service';
import { UserService } from 'src/moduls/user/user.service';



@WebSocketGateway({
  cors: { origin: '*', creadentials: true},
  namespace: 'masseget',
})
  export class MassagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server
    privateConversationsUser = new Map<string, string>();
    private typingUser = new Map<string, NodeJS.Timeout>();
  constructor(
    private readonly massagesService: MassagesService,
    private readonly conversationsService: ConversationsService,
    private readonly userServise: UserService,
  ) {}

  @SubscribeMessage('createMassage')
  @WebSocketServer()
  async create(@MessageBody() createMassageDto: CreateMassageDto) {
    return 
  }

  @SubscribeMessage('findAllMassages')
  findAll() {
    return this.massagesService.findAll();
  }

  @SubscribeMessage('findOneMassage')
  findOne(@MessageBody() id: number) {
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
}
