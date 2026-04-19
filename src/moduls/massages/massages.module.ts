import { Module } from '@nestjs/common';
import { MassagesService } from './massages.service';
import { MassagesGateway } from './massages.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Massage } from './entities/massage.entity';
import { ConversationsModule } from '../conversations/conversations.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Massage]),
    ConversationsModule, 
    UserModule
  ],
  providers: [MassagesGateway, MassagesService],
   exports: [MassagesService],
})
export class MassagesModule {}
