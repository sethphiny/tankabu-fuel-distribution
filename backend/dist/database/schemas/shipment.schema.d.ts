import { Checkpoint } from './checkpoint.schema';
export declare class Shipment {
    id: number;
    manifest_id: string;
    product_type: string;
    volume: number;
    price: number;
    station_address: string;
    driver_address: string;
    status: string;
    created_at: Date;
    checkpoints: Checkpoint[];
}
