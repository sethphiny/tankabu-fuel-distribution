import { Repository, DataSource } from 'typeorm';
import { Shipment } from '../database/schemas/shipment.schema';
import { Checkpoint } from '../database/schemas/checkpoint.schema';
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
