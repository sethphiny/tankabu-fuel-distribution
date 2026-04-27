import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { Shipment } from './entities/shipment.entity';
import { Checkpoint } from './entities/checkpoint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, Checkpoint])],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
