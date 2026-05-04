import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpsertCheckpointDto {
  @IsString()
  shipment_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  status: string;

  @IsNumber()
  @Min(0)
  volume_recorded: number;

  @IsNumber()
  variance: number;
}
