import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Database Module
 * 
 * This module configures the database connection using TypeORM.
 * 
 * TODO: Customize the database configuration:
 * - Update entity paths to match your schema location
 * - Configure migrations path
 * - Adjust SSL settings for production
 * - Add connection pooling options if needed
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres', // Change to 'mysql', 'sqlite', etc. if needed
          url: configService.get('database.url'),
          // Optional: Use schema configuration for multi-tenant setups
          // schema: configService.get('database.schemaLive'),
          
          // Entity paths - update to match your schema location
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          
          // MVP Requirement: synchronize true
          synchronize: true,
          
          // SSL configuration (usually required for Render Postgres)
          ssl: process.env.NODE_ENV === 'production' 
            ? { rejectUnauthorized: false } 
            : false,
          
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule { }

