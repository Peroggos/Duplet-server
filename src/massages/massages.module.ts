import { Module } from '@nestjs/common';
import { MassagesService } from './massages.service';
import { MassagesGateway } from './massages.gateway';

@Module({
  providers: [MassagesGateway, MassagesService],
})
export class MassagesModule {}
