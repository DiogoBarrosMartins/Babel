import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { KafkaModule } from '../../libs/kafka/kafka.module';
import { join } from 'path';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '.env'),
      isGlobal: true,
    }),
    KafkaModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
