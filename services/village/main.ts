import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);

  const kafkaBroker = configService.getOrThrow<string>('KAFKA_BROKER');
  const kafkaGroup = configService.getOrThrow<string>('KAFKA_GROUP');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [kafkaBroker],
        },
        consumer: {
          groupId: kafkaGroup,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
