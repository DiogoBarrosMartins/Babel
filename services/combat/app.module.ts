import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { KafkaModule } from '../../libs/kafka/kafka.module';
import { join } from 'path';
import { CombatModule } from './modules/combat/combat.module';
import { KafkaController } from './kafka/combat.controller';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '.env'),
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379,
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
    KafkaModule,
    CombatModule,
  ],
  controllers: [AppController, KafkaController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
