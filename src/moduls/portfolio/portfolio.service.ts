import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { MediaType, Portfolio } from './entities/portfolio.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PortfolioService {
  
  constructor( 
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>
  ){}
  
  async create(createPortfolioDto: CreatePortfolioDto, user_id: string) {
    // Проверка на существование портфолио с таким же названием
    const isExist = await this.portfolioRepository.findOne({
      where: {
        title: createPortfolioDto.title,
        user_id: user_id
      }
    });
    
    if (isExist) {
      throw new BadRequestException('Portfolio with this title already exists');
    }

    const newPortfolio = this.portfolioRepository.create({
      title: createPortfolioDto.title,
      media_url: createPortfolioDto.media_url,
      media_type: createPortfolioDto.media_type || MediaType.IMAGE,
      description: createPortfolioDto.description,
      order: createPortfolioDto.order || 0,
      user_id: user_id
    });
    
    return await this.portfolioRepository.save(newPortfolio);
  }

  async findAll(user_id: string) {
    return await this.portfolioRepository.find({
      where: {
        user_id: user_id
      },
      order: {
        order: 'ASC',
        created_at: 'DESC',
      }
    });
  }

  async findOne(id: string) {
    const portfolio = await this.portfolioRepository.findOne({
      where: {
        id: id
      }
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
    
    // Обновляем поля (используем явное присваивание)
    if (updatePortfolioDto.title !== undefined) {
      portfolio.title = updatePortfolioDto.title;
    }
    if (updatePortfolioDto.media_url !== undefined) {
      portfolio.media_url = updatePortfolioDto.media_url;
    }
    if (updatePortfolioDto.media_type !== undefined) {
      portfolio.media_type = updatePortfolioDto.media_type;
    }
    if (updatePortfolioDto.description !== undefined) {
      portfolio.description = updatePortfolioDto.description;
    }
    if (updatePortfolioDto.order !== undefined) {
      portfolio.order = updatePortfolioDto.order;
    }
    
    // Сохраняем
    await this.portfolioRepository.save(portfolio);
    
    return portfolio;
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