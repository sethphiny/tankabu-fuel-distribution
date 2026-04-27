import {
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';

/**
 * Base Entity Class
 * 
 * All your database entities should extend this class to get:
 * - UUID primary key (id)
 * - Automatic createdOn timestamp
 * - Automatic updatedOn timestamp
 * 
 * Usage:
 * ```typescript
 * import { Entity, Column } from 'typeorm';
 * import { BaseEntity } from './base.schema';
 * 
 * @Entity('users')
 * export class User extends BaseEntity {
 *   @Column()
 *   email: string;
 *   
 *   @Column()
 *   name: string;
 * }
 * ```
 */
export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: Date })
  createdOn: Date;

  @UpdateDateColumn({ type: Date })
  updatedOn: Date;
}

