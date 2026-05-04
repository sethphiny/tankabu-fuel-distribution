import { Injectable, InternalServerErrorException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Shipment } from '../database/schemas/shipment.schema';
import { Checkpoint } from '../database/schemas/checkpoint.schema';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpsertCheckpointDto } from './dto/upsert-checkpoint.dto';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentsRepository: Repository<Shipment>,
    @InjectRepository(Checkpoint)
    private checkpointsRepository: Repository<Checkpoint>,
    private dataSource: DataSource,
  ) {}

  async findAllShipments() {
    return this.shipmentsRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async createShipment(data: CreateShipmentDto) {
    const { manifest_id, product_type, volume, price, station_address, driver_address, planned_route } = data;
    
    // Check if manifest_id already exists to prevent generic DB error
    const existingShipment = await this.shipmentsRepository.findOne({ where: { manifest_id } });
    if (existingShipment) {
      throw new ConflictException(`Shipment with manifest ID ${manifest_id} already exists.`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const shipment = this.shipmentsRepository.create({
        manifest_id, product_type, volume, price, station_address, driver_address
      });
      const savedShipment = await queryRunner.manager.save(shipment);

      if (planned_route && Array.isArray(planned_route)) {
        const checkpoints = planned_route.map(stopName => 
          this.checkpointsRepository.create({
            shipment_id: manifest_id,
            name: stopName,
            location: stopName,
            status: 'PENDING',
            volume_recorded: 0,
            variance: 0
          })
        );
        await queryRunner.manager.save(checkpoints);
      }

      await queryRunner.commitTransaction();
      return { id: savedShipment.id, ...data };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err.code === '23505') {
        throw new ConflictException(`Shipment with manifest ID ${manifest_id} already exists.`);
      }
      throw new BadRequestException(err.message || 'Failed to create shipment due to invalid data.');
    } finally {
      await queryRunner.release();
    }
  }

  async updateShipmentStatus(manifestId: string, status: string) {
    const result = await this.shipmentsRepository.update(
      { manifest_id: manifestId },
      { status }
    );

    if (result.affected === 0) {
      throw new NotFoundException(`Shipment with manifest ID ${manifestId} not found.`);
    }

    return { success: true, updated: result.affected };
  }

  async findCheckpoints(shipmentId: string) {
    if (!shipmentId) {
      throw new BadRequestException('shipmentId query parameter is required');
    }
    
    const shipment = await this.shipmentsRepository.findOne({ where: { manifest_id: shipmentId } });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${shipmentId} not found.`);
    }

    return this.checkpointsRepository.find({
      where: { shipment_id: shipmentId },
      order: { timestamp: 'ASC' },
    });
  }

  async upsertCheckpoint(data: UpsertCheckpointDto) {
    const { shipment_id, name, location, status, volume_recorded, variance } = data;
    
    // 1. Check if shipment exists
    const shipment = await this.shipmentsRepository.findOne({
      where: { manifest_id: shipment_id }
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with manifest ID ${shipment_id} does not exist.`);
    }

    // 2. Find existing checkpoint
    const existing = await this.checkpointsRepository.findOne({
      where: { shipment_id, name, status: 'PENDING' }
    });

    if (!existing) {
      throw new NotFoundException(`Pending checkpoint '${name}' for shipment '${shipment_id}' not found or already processed.`);
    }

    // 3. Update existing checkpoint
    existing.location = location || existing.location;
    existing.status = status;
    existing.volume_recorded = volume_recorded;
    existing.variance = variance;
    existing.timestamp = new Date();
    
    const saved = await this.checkpointsRepository.save(existing);
    return { id: saved.id, ...data, updated: true };
  }
}
