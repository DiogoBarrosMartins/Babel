import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const httpApp = await NestFactory.create(AppModule);

  const configService = httpApp.get(ConfigService);

  const kafkaBroker = configService.getOrThrow<string>('KAFKA_BROKER');
  const kafkaGroup = configService.getOrThrow<string>('KAFKA_GROUP');
  const port = configService.get<number>('APP_PORT') || 3002;

  const config = new DocumentBuilder()
    .setTitle('Village Service')
    .setDescription('Village microservice API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(httpApp, config);
  SwaggerModule.setup('api', httpApp, document);

  await httpApp.listen(port);
  console.log(`HTTP app running on http://localhost:${port}/api`);

  const kafkaApp = await NestFactory.createMicroservice<MicroserviceOptions>(
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

  await kafkaApp.listen();
  console.log(`Kafka microservice listening...`);
}

bootstrap();
