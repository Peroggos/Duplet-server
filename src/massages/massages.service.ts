import { Injectable } from '@nestjs/common';
import { CreateMassageDto } from './dto/create-massage.dto';
import { UpdateMassageDto } from './dto/update-massage.dto';

@Injectable()
export class MassagesService {
  create(createMassageDto: CreateMassageDto) {
    return 'This action adds a new massage';
  }

  findAll() {
    return `This action returns all massages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} massage`;
  }

  update(id: number, updateMassageDto: UpdateMassageDto) {
    return `This action updates a #${id} massage`;
  }

  remove(id: number) {
    return `This action removes a #${id} massage`;
  }
}
