import { ForbiddenException, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { CreateMassageDto } from './dto/create-massage.dto';
import { UpdateMassageDto } from './dto/update-massage.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationsService } from '../conversations/conversations.service';
import { Massage } from './entities/massage.entity';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Injectable()
@UseGuards(JwtAuthGuard)
export class MassagesService {
  constructor(
    private readonly conversationService: ConversationsService,
    @InjectRepository(Massage)
    private readonly massageRepository: Repository<Massage>
  ) {}
  async createMassage(senderId: string, createMassageDto: CreateMassageDto): Promise<Massage> {
    const isParticipant = await this.conversationService.isParticipant(
      createMassageDto.conversationId,
      senderId
    )
    if(!isParticipant) {
      throw new ForbiddenException('You are not a participant of this conversation')
    }
    const massage = this.massageRepository.create({
      ...createMassageDto,
        senderId,
        readBy: [senderId]
    })
    const saveMasge = await this.massageRepository.save(massage)

    const messageWithSender = await this.massageRepository.findOne({
      where: { id: saveMasge.id},
      relations: ['sender']
    });

    await this.conversationService.updateLastMessage(
      createMassageDto.conversationId,
      messageWithSender!,
    )

    return messageWithSender!
  }
  getConversationsMassage(conversationId: string, limit:number = 50, offset:number = 0) {
    return this.massageRepository.find({
      where: { conversationId, isDeleted: false},
      relations: ['sender'],
      take: limit,
      skip: offset,
    });
  }


  async markAsRead(massageIds: string[], user_id: string ) {
    await this.massageRepository
    .createQueryBuilder()
    .update(Massage)
    .set({
      readBy: () => `array_append(readBy, ${user_id})`
    })
    .where(`id IN (:...ids)`, { ids: massageIds })
    .andWhere(`NOT (:...user_id = ANY(readBy))`, { user_id })
    .execute();
  }

  async deleteMassage(massageId: string, user_id: string) {
    const massage = await this.massageRepository.findOne({
      where: {id: massageId}
    })
    if(!massage) {
      throw new NotFoundException('Message not found');
    }
    if(massage.senderId !== user_id) {
      throw new ForbiddenException('You can only delete your own messages');
    }
    await this.massageRepository.update(massageId, {
      isDeleted: true,
      content: '[Сообщение удaлено]'
    })
  }
}
