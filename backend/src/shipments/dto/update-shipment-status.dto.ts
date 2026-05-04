import { IsString, IsIn } from 'class-validator';

export class UpdateShipmentStatusDto {
  @IsString()
  @IsIn(['DISPATCHED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'])
  status: string;
}
