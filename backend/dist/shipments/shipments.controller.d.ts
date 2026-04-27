import { ShipmentsService } from './shipments.service';
export declare class ShipmentsController {
    private readonly shipmentsService;
    constructor(shipmentsService: ShipmentsService);
    findAll(): Promise<import("./entities/shipment.entity").Shipment[]>;
    create(body: any): Promise<any>;
    updateStatus(manifestId: string, status: string): Promise<{
        success: boolean;
        updated: number;
    }>;
    findCheckpoints(shipmentId: string): Promise<import("./entities/checkpoint.entity").Checkpoint[]>;
    upsertCheckpoint(body: any): Promise<any>;
}
