import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { Shipment } from '../database/schemas/shipment.schema';
import { Checkpoint } from '../database/schemas/checkpoint.schema';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, Checkpoint])],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
