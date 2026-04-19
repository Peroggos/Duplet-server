import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as argon2 from "argon2";
import { JwtService } from '@nestjs/jwt';
import { emitWarning, title } from 'process';
import { Category } from '../category/entities/category.entity';
import { Portfolio } from '../portfolio/entities/portfolio.entity';
import { ChangePasswordDto } from '../auth/dto/auth.dto';


@Injectable()
export class UserService {
  // create(createUserDto: CreateUserDto) {
  //   throw new Error('Method not implemented.');
  // }
    private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) 
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category) 
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Portfolio) 
    private readonly PortfolioRepository: Repository<Portfolio>,
    
    //private readonly jwtService: JwtService,
  ) {}

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id},
      relations: ['categories', 'portfolio'],
    })

    if(!user){
        throw new NotFoundException('User not found');
    }
    return user
  }


  async findByEmail(email: string): Promise<User | null> {
    const user = this.userRepository.findOne({  
      where:{ email: email.toLocaleLowerCase()},
      select: ['avatar','bio','email','id','isOnline','password']
    })
    if(!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }


  async findByAuth(email: string) {
    return this.userRepository.findOne({
      where: {email},
      select: ['id', 'email', 'password', 'avatar', 'bio', 'isOnline']
    })
  }

  async updateProfilee(user_id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(user_id)
    if(updateUserDto.username) user.username = updateUserDto.username
    if(updateUserDto.bio !== undefined)  user.bio = updateUserDto.username
    
    if (updateUserDto.categories) {
      const categories = await this.categoryRepository.findBy({
        id: In(updateUserDto.categories)
      });
      user.categories = categories
    }
    await this.userRepository.save(user)

    return this.findById(user_id)
  } 

  async changePassword(user_id: string, changePasswordDto: ChangePasswordDto){
    const user = await this.userRepository
    .createQueryBuilder('user')
    .where('user.id = :id', {id: user_id})
    .addSelect('user.password')
    .getOne();

    if(!user){
        throw new NotFoundException('User not found');
    }
    const isValid = await argon2.verify(
      changePasswordDto.oldPassword, 
      user.password)
      if(!isValid) {
        throw new ConflictException('Invalid current password')
      }
    user.password = await argon2.hash(changePasswordDto.newPassword)
    await this.userRepository.save(user)
  }
  async addPortfolioItem( user_id: string, data: { mediaUrl: string, title?: string}) {
    const user = await this.findById(user_id)

    const maxOrder = await this.PortfolioRepository
    .createQueryBuilder('item')
    .select('MAX(item.order)', 'max')
    .where('item.user_id = :user_id', { user_id })
    .getRawOne();

    const item = this.PortfolioRepository.create({
      user_id: user_id,
      media_url: data.mediaUrl,
      title: data.title,
      order: (maxOrder?.max || 0) + 1
    })

    return this.PortfolioRepository.save(item)
  }
  async deletePortfolio(user_id: string, item_id: string) {
    const item = await this.PortfolioRepository.findOne({
      where: { user_id },
    })
    if(!item) {
      throw new NotFoundException('Invalid current item')
    }
    return this.PortfolioRepository.delete(item)
  }

  async getPortfolio(user_id: string) {
    return this.PortfolioRepository.find({
      where: { user_id },
      order: { order: 'ASC' }
    })
  }

  async updateOnlineStatus(user_id: string, isOnline: boolean) {
    this.logger.debug(`User:${user_id} is now ${isOnline ? 'online': 'offline'}`)
  }

  async createCategory(name: string, icon?: string): Promise<Category> {
    const category = this.categoryRepository.create({ name, icon });
    return this.categoryRepository.save(category);
  }
}
