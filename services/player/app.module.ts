import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { KafkaModule } from '../../libs/kafka/kafka.module'; // adjust path if needed
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '.env'),
      isGlobal: true,
    }),
    KafkaModule,
  ],
  providers: [AppService],
  controllers: [AppController],
  exports: [AppService],
})
export class AppModule {}
