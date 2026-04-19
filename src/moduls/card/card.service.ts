import { Injectable, Logger, NotFoundException, UseGuards } from '@nestjs/common';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoreThan, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Match } from '../matches/entities/match.entity';
import { EventEmitter } from 'stream';
import { match } from 'assert';

@Injectable()
@UseGuards(JwtAuthGuard)
export class CardService {
  private readonly logger = new Logger(CardService.name);
  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly eventEmitter: EventEmitter,
  
  ) {}
  
  async getCardForUser(user_id: string, limit: number = 5){
    const user = await this.userRepository.findOne({
      where: { id: user_id},
      relations: ['categories','portfolio']
    })

    if (!user){
      return []
    }

    const swipedUserIds = await this.getRecentlySwipedUserIds(user_id)

    const query =  this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.categories', 'categories')
    .leftJoinAndSelect('user.portfolio', 'portfolio')
    .where('user.id != :user_id', {user_id})
    .andWhere('user.id NOT IN (:...swipedUserIds)', {
      swipedUserIds: swipedUserIds.length ? swipedUserIds : ['00000000-00000000']
    })

    query
      .orderBy('user.createdAt', 'DESC')
      .take(limit)
      const cards = await query.getMany()
      return cards;
  }
  async swipe(user_id:string,targetUserId: string, data: {isLike?: boolean, isDislike: boolean} ) {
    const existingSwipe = await this.cardRepository.findOne({
        where: {
          user_id: user_id,
          targetUserId: targetUserId,
          expiresAt: MoreThan(new Date())
        }
    })
    if(existingSwipe) {
      this.logger.log(`User ${user_id} already swiped ${targetUserId}`)
      return { isMatch: false}
    }
    const swipe = await this.cardRepository.findOne({
        where: {
          user_id: user_id,
          targetUserId: targetUserId,
          isDislike: data.isDislike || false,
          isLike: data.isLike || false,
          expiresAt: MoreThan(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
        }
    })
    await this.cardRepository.save(swipe!)

    if(data.isLike == true) {
      const mutualSwipe = await this.cardRepository.findOne({
        where: {
          user_id: targetUserId,
          targetUserId: user_id,
          isLike: true,
          expiresAt: MoreThan(new Date())
        }
      })
      if(mutualSwipe){
        const match = await this.createMatch(user_id,targetUserId)

         if (this.eventEmitter) {
        this.eventEmitter.emit('match.created',
          {
            mutchId: match.id,
            user_id_1: user_id,
            user_id_2: targetUserId,

          }
        )
        }
        return { isMatch: true, match}
      }
      return { isMatch: false };
    }
  }

  private async createMatch(user_id_1: string, user_id_2: string) {
    const [firstId, secondId] = [user_id_1, user_id_2].sort()

    const match = await this.matchRepository.create({
      user_id_1: firstId,
      user_id_2: secondId,
      status: 'active'
    })
    return this.matchRepository.save(match)
  }
  private async getRecentlySwipedUserIds(user_id: string) {
    const swipe = await this.cardRepository.find({
      where: {
      user_id: user_id,
      expiresAt: MoreThan(new Date())
      },
      select:['targetUserId'],
      order: {expiresAt: 'DESC'},
      take: 1000
    })
    return swipe.map((s) => s.targetUserId)
  }
}
