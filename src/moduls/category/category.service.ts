import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';


@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
        @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}


async create(createCategoryDto: CreateCategoryDto, user_id: string) {
    const user = await this.userRepository.findOne({
        where: { id: user_id }
    });
    
    if (!user) {
        throw new NotFoundException('User not found');
    }
    
    const newCategory = this.categoryRepository.create({
        name: createCategoryDto.name,
        label: createCategoryDto.label,
        icon: createCategoryDto.icon,
        user: [user], 
    });
    
    return await this.categoryRepository.save(newCategory);
}

async findAll(user_id: string) {
    const categories = await this.categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.user', 'user')  
        .where('user.id = :user_id', { user_id })
        .getMany();
    
    return categories;
}

async findOne(id: string, user_id: string) {
    const category = await this.categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.user', 'user')  // ← category.user
        .where('category.id = :id', { id })
        .getOne();
    
    if (!category) {
        throw new NotFoundException('Category not found');
    }
    
    const hasAccess = category.user && category.user.some(u => u.id === user_id);
    if (!hasAccess) {
        throw new BadRequestException('You do not have access to this category');
    }
    
    return category;
}

async update(id: string, updateCategoryDto: UpdateCategoryDto, user_id: string) {
  const category = await this.categoryRepository.findOne({
    where: { id: id }, 
    relations: ['user']
  });
  
  if (!category) {
    throw new NotFoundException('Category not found');
  }

  const hasAccess = category.user.some(u => u.id === user_id);
  if (!hasAccess) {
    throw new BadRequestException('You do not have access to this category');
  }
  
  const { user, ...updateData } = updateCategoryDto as any;
  
  await this.categoryRepository.update(id, updateData);
  
  return await this.categoryRepository.findOne({
    where: { id: id },
    relations: ['user']
  });
}
  async remove(id: string, user_id: string) {
     const isExist = await this.findOne(id, user_id)
    
    return await this.categoryRepository.remove(isExist)
  }

  async addUserToCategori(user_id: string, categoriIds: string) {
    const category = await this.categoryRepository.findOne(
      {
        where:{ id: user_id},
        relations: ['user']
      }
    )
    const user = await this.userRepository.findOne({
      where: { id: user_id}
    })
    if(!category || !user){
      throw new NotFoundException('Category not found');
    }
    const isAlreadyAdded = category.user.some(u => u.id === user_id)
      if (!isAlreadyAdded) {
      category.user.push(user);
      await this.categoryRepository.save(category);
    }
    return category
  }

  async removeUserFromCategory(categoryId: string, user_id: string) {
  const category = await this.categoryRepository.findOne({
    where: { id: categoryId },
    relations: ['user']
  });
  
  if (!category) {
    throw new NotFoundException('Category not found');
  }
  
  category.user = category.user.filter(user => user.id !== user_id);
  
  await this.categoryRepository.save(category);
  
  return { message: 'User removed from category successfully' };
}


 
}
