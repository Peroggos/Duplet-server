import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { use } from 'passport';

@Injectable()
@UseGuards(JwtAuthGuard)
export class CardService {
  
  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>
  
  ) {}
  async create(createCardDto: CreateCardDto, user_id: string) {
    const user = await this.userRepository.findOne({
      where: { id: user_id}
    })
    if (!user) throw new NotFoundException('User not found');
    
    const newCard = await this.cardRepository.create({
      ...createCardDto,
      user: user
    })
    return this.cardRepository.save(newCard);
  }

  async findAll(user_id: string) {
    const card = await this.userRepository
    .createQueryBuilder('Swipe')
    .leftJoinAndSelect('Swipe.user', 'user')
    .where('user.id := user_id', {user_id})
    .getMany()
    return card;
  }

  async findOne(id: string, user_id: string) {
    const card = await this.userRepository
    .createQueryBuilder('Swipe')
    .leftJoinAndSelect('Swipe.user', 'user')
    .where('Swipe.user := id', {id})
    .getOne()
    return card;
  }

  // async update(id: string,user_id: string ,updateCardDto: UpdateCardDto, ) {

  //   const card = await this.cardRepository.findOne({
  //     where: { id: id, user_id: user_id}
  //   })
  //    if(!card) throw new NotFoundException('Сard not found');

  // }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
