import { DataSource } from 'typeorm';
import { config } from 'dotenv';

/**
 * TypeORM Data Source Configuration
 * 
 * This file is used by TypeORM CLI for running migrations.
 * It should match your database configuration in database.module.ts
 * 
 * TODO: Update the configuration to match your database setup:
 * - Update DATABASE_URL in your .env file
 * - Adjust entity and migration paths
 * - Configure SSL settings for production
 */

// Load environment variables
config();

export const DatabaseSource = new DataSource({
    type: 'postgres', // Change to match your database type
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname',
    
    // Optional: Schema configuration for multi-tenant setups
    // schema: process.env.DATABASE_SCHEMA_LIVE || 'public',
    
    // Entity paths - update to match your schema location
    entities: [__dirname + '/../**/*.schema{.ts,.js}'],
    
    // Migrations path
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    
    // WARNING: Set synchronize to false in production!
    synchronize: false,
    
    // SSL configuration
    ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
    
    // Enable logging for migrations
    logging: true,
});

// Export as default for TypeORM CLI compatibility
export default DatabaseSource;

