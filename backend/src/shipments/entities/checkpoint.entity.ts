import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Shipment } from './shipment.entity';

@Entity('checkpoints')
export class Checkpoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shipment_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  location: string;

  @Column()
  status: string;

  @Column('decimal', { default: 0 })
  volume_recorded: number;

  @Column('decimal', { default: 0 })
  variance: number;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Shipment, shipment => shipment.checkpoints)
  @JoinColumn({ name: 'shipment_id', referencedColumnName: 'manifest_id' })
  shipment: Shipment;
}
