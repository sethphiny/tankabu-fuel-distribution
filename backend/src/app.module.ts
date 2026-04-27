import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ShipmentsController } from './shipments/shipments.controller';
import { ShipmentsService } from './shipments/shipments.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
})
export class AppModule {}
