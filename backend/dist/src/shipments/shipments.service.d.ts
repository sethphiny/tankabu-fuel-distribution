import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class ShipmentsService implements OnModuleInit {
    private configService;
    private db;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    private initDb;
    findAllShipments(): unknown[];
    createShipment(data: any): any;
    updateShipmentStatus(manifestId: string, status: string): {
        success: boolean;
        updated: number;
    };
    findCheckpoints(shipmentId: string): unknown[];
    upsertCheckpoint(data: any): any;
}
