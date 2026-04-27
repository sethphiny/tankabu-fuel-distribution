import { Repository, SelectQueryBuilder, EntityTarget } from 'typeorm';

/**
 * Base Repository Class
 * 
 * This class provides helper methods for schema-aware queries.
 * Useful for multi-tenant applications or applications with multiple schemas.
 * 
 * TODO: Customize this repository based on your needs:
 * - Remove schema-related methods if you don't need multi-schema support
 * - Add custom query methods common to your entities
 * - Add soft delete support if needed
 * 
 * Usage:
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import { InjectRepository } from '@nestjs/typeorm';
 * import { BaseSchemaRepository } from './base-schema.repository';
 * import { User } from '../schemas/user.schema';
 * 
 * @Injectable()
 * export class UserRepository extends BaseSchemaRepository<User> {
 *   constructor(
 *     @InjectRepository(User)
 *     repository: Repository<User>,
 *   ) {
 *     super(User, repository.manager, undefined);
 *   }
 * }
 * ```
 */
export class BaseSchemaRepository<T> extends Repository<T> {
  constructor(
    target: EntityTarget<T>,
    manager: any,
    // TODO: Add SchemaContextService if you need multi-schema support
    // private readonly schemaContextService?: SchemaContextService,
  ) {
    super(target, manager);
  }

  /**
   * Create a query builder with schema-qualified table name
   * Useful for multi-tenant or multi-schema applications
   */
  createQueryBuilderWithSchema(schema: string, alias?: string): SelectQueryBuilder<T> {
    const tableName = this.metadata.tableName;
    const schemaQualifiedTable = `${schema}.${tableName}`;
    const qb = this.createQueryBuilder(alias);
    
    // Override the table name in the query builder
    (qb as any).expressionMap.mainAlias!.metadata.tableName = schemaQualifiedTable;
    
    return qb;
  }

  /**
   * Get schema-qualified table name
   */
  getSchemaQualifiedTableName(schema: string): string {
    const tableName = this.metadata.tableName;
    return `${schema}.${tableName}`;
  }

  /**
   * Helper to execute raw query with schema
   */
  async queryWithSchema(schema: string, query: string, parameters?: any[]): Promise<any> {
    const tableName = this.metadata.tableName;
    const schemaQualifiedTable = `${schema}.${tableName}`;
    const schemaQuery = query.replace(new RegExp(`"${tableName}"`, 'g'), `"${schemaQualifiedTable}"`);
    return await this.manager.query(schemaQuery, parameters);
  }
}

