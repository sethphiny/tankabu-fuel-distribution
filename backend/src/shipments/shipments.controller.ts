import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpsertCheckpointDto } from './dto/upsert-checkpoint.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

@Controller('api')
@UseGuards(ApiKeyGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get('shipments')
  findAll() {
    return this.shipmentsService.findAllShipments();
  }

  @Post('shipments')
  create(@Body() body: CreateShipmentDto) {
    return this.shipmentsService.createShipment(body);
  }

  @Patch('shipments/:manifestId')
  updateStatus(
    @Param('manifestId') manifestId: string,
    @Body() body: UpdateShipmentStatusDto,
  ) {
    return this.shipmentsService.updateShipmentStatus(manifestId, body.status);
  }

  @Get('checkpoints')
  findCheckpoints(@Query('shipmentId') shipmentId: string) {
    return this.shipmentsService.findCheckpoints(shipmentId);
  }

  @Post('checkpoints')
  upsertCheckpoint(@Body() body: UpsertCheckpointDto) {
    return this.shipmentsService.upsertCheckpoint(body);
  }
}
