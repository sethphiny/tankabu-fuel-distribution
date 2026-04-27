import { Repository, DataSource } from 'typeorm';
import { Shipment } from './entities/shipment.entity';
import { Checkpoint } from './entities/checkpoint.entity';
export declare class ShipmentsService {
    private shipmentsRepository;
    private checkpointsRepository;
    private dataSource;
    constructor(shipmentsRepository: Repository<Shipment>, checkpointsRepository: Repository<Checkpoint>, dataSource: DataSource);
    findAllShipments(): Promise<Shipment[]>;
    createShipment(data: any): Promise<any>;
    updateShipmentStatus(manifestId: string, status: string): Promise<{
        success: boolean;
        updated: number;
    }>;
    findCheckpoints(shipmentId: string): Promise<Checkpoint[]>;
    upsertCheckpoint(data: any): Promise<any>;
}
