import { ShipmentsService } from './shipments.service';
export declare class ShipmentsController {
    private readonly shipmentsService;
    constructor(shipmentsService: ShipmentsService);
    findAll(): unknown[];
    create(body: any): any;
    updateStatus(manifestId: string, status: string): {
        success: boolean;
        updated: number;
    };
    findCheckpoints(shipmentId: string): unknown[];
    upsertCheckpoint(body: any): any;
}
