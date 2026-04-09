import { Injectable, NotFoundException } from '@nestjs/common';
import { Conversation } from './entities/conversation.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/moduls/user/entities/user.entity';
import { Massage } from '../massages/entities/massage.entity';



@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
  ) {}


  async createConversation(data: {participants: string[], name?: string, isGroup?: boolean}) {
    const participants = await this.conversationRepository.findByIds(data.participants)
    
    const conversation = this.conversationRepository.create({
      participants,
      isGroup: data.isGroup || false,
      name: data.name
    })
    return this.conversationRepository.save(conversation);
  }

  async getUserConversation(user_id: string) {
    return this.conversationRepository
    .createQueryBuilder('conversation')
    .leftJoinAndSelect('conversation.participants', 'participant')
    .leftJoinAndSelect('conversation.messages', 'message')
    .where('participant.id = :userId', {user_id})
    .orderBy('conversation.updatedAt', 'DESC')
    .getMany();
  }

  async getConversationById(id: string) {
   const isExzit = await this.conversationRepository.findOne({

    where: { id }, 
    relations: ['participants', 'messages', 'messages.sender'],
   })
   if (!isExzit) throw new NotFoundException('Conversation not found')

  return isExzit
  }

  async isParticipant(conversationId: string, user_id: string) {
      const conversation = await this.conversationRepository.findOne(
        {
          where: {id: conversationId},
          relations: ['participants']
        }
      )
      return conversation?.participants.some(p => p.id === user_id || false)
  }
  async updateLastMessage(conversationId: string, massage: Massage) {
    await this.conversationRepository.update(conversationId, {
      lastMessage: {
      id: massage.id,
      content: massage.content.substring(0, 100),
      senderId: massage.senderId,
      senderName: massage.sender?.username || massage.sender?.email,
      createdAt: massage.createdAt,
      },
      updatedAt: new Date(),
    })
  }
  async getOrCreatePrivateChat(userId1: string, userId2: string) {
    const isexzit = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.participants', 'participant')
      .where('conversation.isGroup = false')
      .andWhere('participant.id IN (:...userIds)', { userIds: [userId1, userId2] })
      .groupBy('conversation.id')
      .having('COUNT(participant.id) = 2')
      .getOne();
      
      if(isexzit) { return isexzit  }
      return this.createConversation({
        participants: [userId1,userId2],
        isGroup: false
      });
      
      } 
  }


