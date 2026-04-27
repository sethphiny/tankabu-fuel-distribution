import { Repository, SelectQueryBuilder, EntityTarget } from 'typeorm';
export declare class BaseSchemaRepository<T> extends Repository<T> {
    constructor(target: EntityTarget<T>, manager: any);
    createQueryBuilderWithSchema(schema: string, alias?: string): SelectQueryBuilder<T>;
    getSchemaQualifiedTableName(schema: string): string;
    queryWithSchema(schema: string, query: string, parameters?: any[]): Promise<any>;
}
