import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const httpApp = await NestFactory.create(AppModule);

  const configService = httpApp.get(ConfigService);
  const kafkaBroker = configService.getOrThrow<string>('KAFKA_BROKER');
  const kafkaGroup = configService.getOrThrow<string>('KAFKA_GROUP');
  const port = configService.get<number>('APP_PORT') || 3005;

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Race Service')
    .setDescription('Race microservice API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(httpApp, swaggerConfig);
  SwaggerModule.setup('api', httpApp, document);

  await httpApp.listen(port);
  console.log(`🌍 HTTP app running on http://localhost:${port}/api`);

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
  console.log('📡 Kafka microservice listening...');
}
bootstrap();
