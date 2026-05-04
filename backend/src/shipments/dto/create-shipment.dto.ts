import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

export class CreateShipmentDto {
  @IsString()
  manifest_id: string;

  @IsString()
  product_type: string;

  @IsNumber()
  @Min(0)
  volume: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  station_address: string;

  @IsString()
  driver_address: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  planned_route?: string[];
}
