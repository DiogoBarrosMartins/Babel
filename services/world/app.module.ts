import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { KafkaModule } from '../../libs/kafka/kafka.module';
import { join } from 'path';
import { KafkaController } from './kafka/kafka.controller';
import { WorldModule } from './modules/world/world.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '.env'),
      isGlobal: true,
    }),
    KafkaModule,
    WorldModule,
  ],
  controllers: [AppController, KafkaController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
