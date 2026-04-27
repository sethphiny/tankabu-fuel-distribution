import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('api')
@UseGuards(ApiKeyGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get('shipments')
  findAll() {
    return this.shipmentsService.findAllShipments();
  }

  @Post('shipments')
  create(@Body() body: any) {
    return this.shipmentsService.createShipment(body);
  }

  @Patch('shipments/:manifestId')
  updateStatus(@Param('manifestId') manifestId: string, @Body('status') status: string) {
    return this.shipmentsService.updateShipmentStatus(manifestId, status);
  }

  @Get('checkpoints')
  findCheckpoints(@Query('shipmentId') shipmentId: string) {
    return this.shipmentsService.findCheckpoints(shipmentId);
  }

  @Post('checkpoints')
  upsertCheckpoint(@Body() body: any) {
    return this.shipmentsService.upsertCheckpoint(body);
  }
}
