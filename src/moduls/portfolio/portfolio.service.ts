import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { MediaType, Portfolio } from './entities/portfolio.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PortfolioService {
   private readonly logger = new Logger(PortfolioService.name);
  constructor( 
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}
  
  // portfolio.service.ts - ПРОСТОЙ И РАБОЧИЙ вариант
async create(createPortfolioDto: CreatePortfolioDto, user_id: string) {
  const user = await this.userRepository.findOne({
    where: { id: user_id }
  });
  
  if (!user) {
    throw new NotFoundException('User not found');
  }
  
  if (createPortfolioDto.title) {
    const existing = await this.portfolioRepository.findOne({
      where: { title: createPortfolioDto.title, user_id: user_id }
    });
    if (existing) {
      throw new BadRequestException('Portfolio item with this title already exists');
    }
  }
  
  // ✅ ПРОСТОЙ СПОСОБ: получаем все items и считаем максимальный order
  const allItems = await this.portfolioRepository.find({
    where: { user_id },
    order: { order: 'DESC' },
    take: 1
  });
  
  const maxOrder = allItems.length > 0 ? allItems[0].order : 0;
  
  const newPortfolio = this.portfolioRepository.create({
    ...createPortfolioDto,
    user_id: user_id,
    order: createPortfolioDto.order ?? maxOrder + 1,
  });
  
  const saved = await this.portfolioRepository.save(newPortfolio);
  this.logger.log(`Portfolio item created for user ${user_id}, id: ${saved.id}`);
  
  return saved;
}

  async findAll(user_id: string, isOptional?: { page?: number, limit?: number}) {

    let query = this.portfolioRepository
    .createQueryBuilder('portfolio')
    .where('portfolio.user_id = :userId', { userId: user_id})

    if (isOptional?.page && isOptional?.limit) {
      const skip = (isOptional.page - 1) * isOptional.limit
      query = query.skip(skip).take(isOptional.limit)
    }
    query = query
      .orderBy('portfolio.order', 'ASC')
      .addOrderBy('portfolio.created_at','DESC')
    const [ item, total ] = await query.getManyAndCount()

    return { item, total }
  }

  async findOne(id: string, user_id?: string) {
  const portfolio = await this.portfolioRepository.findOne({
    where: { id }, 
    relations: ['user']
  });
  
  if (!portfolio) {
    throw new NotFoundException(`Portfolio with ID ${id} not found`);
  }
  
  return portfolio;
}

  async update(id: string, updatePortfolioDto: UpdatePortfolioDto, user_id: string) {
    // Находим портфолио
    const portfolio = await this.portfolioRepository.findOne({
      where: {
        id: id,
        user_id: user_id
      }
    });
    
    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found for this user`);
    }
    
  
    // if (updatePortfolioDto.title !== undefined) {
    //   portfolio.title = updatePortfolioDto.title;
    // }
    // if (updatePortfolioDto.media_url !== undefined) {
    //   portfolio.media_url = updatePortfolioDto.media_url;
    // }
    // if (updatePortfolioDto.media_type !== undefined) {
    //   portfolio.media_type = updatePortfolioDto.media_type;
    // }
    // if (updatePortfolioDto.description !== undefined) {
    //   portfolio.description = updatePortfolioDto.description;
    // }
    // if (updatePortfolioDto.order !== undefined) {
    //   portfolio.order = updatePortfolioDto.order;
    // }
  
    if (updatePortfolioDto.title && updatePortfolioDto.title !== portfolio.title) {
      const exsit = await this.portfolioRepository.findOne({
        where: {
          user_id: user_id,
          title: updatePortfolioDto.title
        }
      })
          if (exsit && exsit.id !== id) {
        throw new BadRequestException('Portfolio item with this title already exists');
      }
    }

    Object.assign(portfolio, updatePortfolioDto)
    // Сохраняем
    const update = await this.portfolioRepository.save(portfolio);
    
    return update;
  }

  async remove(id: string, user_id: string) {
    const portfolio = await this.portfolioRepository.findOne({
      where: {
        id: id,
        user_id: user_id
      }
    });
    
    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found for this user`);
    }
    
    await this.portfolioRepository.remove(portfolio);
    
    return { 
      message: `Portfolio with ID ${id} successfully removed`,
      statusCode: 200 
    };
  }
}