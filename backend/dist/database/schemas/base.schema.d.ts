import { BaseEntity as TypeOrmBaseEntity } from 'typeorm';
export declare abstract class BaseEntity extends TypeOrmBaseEntity {
    id: string;
    createdOn: Date;
    updatedOn: Date;
}
