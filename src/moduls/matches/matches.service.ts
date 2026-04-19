import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { match } from 'assert';
import { NotFoundError, throwError } from 'rxjs';

@Injectable()
export class MatchesService {
  constructor( 
    @InjectRepository(Match)
    private readonly matchesRepository: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ) {}

  async getUserMatch(user_id: string) {
    return this.matchesRepository.findOne({
      where: [
        {user_id_1: user_id, status: 'active'},
        {user_id_2: user_id, status: 'active'}
      ],
      relations: ['user1','user2'],
      order: {lastMessageAt: 'DESC', createdAt: 'DESC'}
    })
  }
  
  async getIdUserMatch(match_id: string, user_id: string) {
    const match = await this.matchesRepository.findOne({
      where: [
        {id: match_id, user_id_1: user_id},
        {id: match_id, user_id_2: user_id},
      ],
      relations: ['user1','user2'],
    })
      if(!match) {
    throw new NotFoundException('Not Match in found')
  }
  return match
  }

  async archiveMatch(match_id: string, user_id: string) {
    const match = await this.getIdUserMatch(match_id,user_id)
    match.status = 'archived'
    await this.matchesRepository.save(match)
  }
  async blockMatch(match_id: string, user_id: string) {
        const match = await this.getIdUserMatch(match_id,user_id)
    match.status = 'blocked'
    await this.matchesRepository.save(match)
  }
  
  async updateMassege(match_id: string) {
    await this.matchesRepository.update(match_id,{
      lastMessageAt: new Date()
    })
  }
  

}
