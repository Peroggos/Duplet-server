import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}


  async create(createCategoryDto: CreateCategoryDto, id: string) {
    const isExist = await this.categoryRepository.findBy(
      {
        user: {id},
        name: createCategoryDto.name,
        label: createCategoryDto.label
      }
    )

    if(isExist.length) throw new BadRequestException('This category alreade exist')

    const newCategory = {
      name: createCategoryDto.name,
      label: createCategoryDto.label,
      user: {
        id
      },


    }
    return await this.categoryRepository.save(newCategory);
  }

  async findAll(id: string) {
    return await this.categoryRepository.find({
      where: {
      user: {id},
    },
    //  relations: {
    //    Portfolio: true,
    //  }
    });
    
  }

  async findOne(id: string) {
    const isExist = await this.categoryRepository.findOne(
      {
        where: {
          id
        },
        relations: {
          user: true
        },
      }
    )
    if(!isExist) throw new NotFoundException('Category not found')
    return isExist;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const isExist = await this.categoryRepository.findOne(
      {
        where: {  id:id  },
      }
    )
    if(!isExist) throw new NotFoundException('categori not found')
    return await this.categoryRepository.update(id, updateCategoryDto)
  }

  async remove(id: string) {
     const isExist = await this.categoryRepository.findOne(
      {
        where: {  id:id  },
      }
    
     )
    if(!isExist) throw new NotFoundException('categori not found')
    return await this.categoryRepository.delete({id});
  }
}
