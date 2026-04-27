import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Checkpoint } from './checkpoint.schema';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  manifest_id: string;

  @Column()
  product_type: string;

  @Column('decimal')
  volume: number;

  @Column('decimal')
  price: number;

  @Column()
  station_address: string;

  @Column()
  driver_address: string;

  @Column({ default: 'DISPATCHED' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Checkpoint, checkpoint => checkpoint.shipment)
  checkpoints: Checkpoint[];
}
