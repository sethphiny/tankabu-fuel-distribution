import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          url: configService.get<string>('database.url'),
          entities: [__dirname + '/../**/*.schema{.ts,.js}'],
          synchronize: true,
          ssl: { rejectUnauthorized: false },
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule { }


