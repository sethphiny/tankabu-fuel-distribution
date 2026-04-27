import { Shipment } from './shipment.schema';
export declare class Checkpoint {
    id: number;
    shipment_id: string;
    name: string;
    location: string;
    status: string;
    volume_recorded: number;
    variance: number;
    timestamp: Date;
    shipment: Shipment;
}
