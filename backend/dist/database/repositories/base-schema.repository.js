"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSchemaRepository = void 0;
const typeorm_1 = require("typeorm");
class BaseSchemaRepository extends typeorm_1.Repository {
    constructor(target, manager) {
        super(target, manager);
    }
    createQueryBuilderWithSchema(schema, alias) {
        const tableName = this.metadata.tableName;
        const schemaQualifiedTable = `${schema}.${tableName}`;
        const qb = this.createQueryBuilder(alias);
        qb.expressionMap.mainAlias.metadata.tableName = schemaQualifiedTable;
        return qb;
    }
    getSchemaQualifiedTableName(schema) {
        const tableName = this.metadata.tableName;
        return `${schema}.${tableName}`;
    }
    async queryWithSchema(schema, query, parameters) {
        const tableName = this.metadata.tableName;
        const schemaQualifiedTable = `${schema}.${tableName}`;
        const schemaQuery = query.replace(new RegExp(`"${tableName}"`, 'g'), `"${schemaQualifiedTable}"`);
        return await this.manager.query(schemaQuery, parameters);
    }
}
exports.BaseSchemaRepository = BaseSchemaRepository;
//# sourceMappingURL=base-schema.repository.js.map