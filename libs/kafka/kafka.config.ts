import { Transport } from '@nestjs/microservices';

export const getKafkaConfig = (groupId: string) => ({
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: [process.env.KAFKA_BROKER || 'redpanda:9092'],
    },
    consumer: {
      groupId,
    },
  },
});
