import { Module } from '@nestjs/common';
import { MassagesService } from './massages.service';
import { MassagesGateway } from './massages.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Massage } from './entities/massage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Massage])
            ],
  providers: [MassagesGateway, MassagesService],
})
export class MassagesModule {}
