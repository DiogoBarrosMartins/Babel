import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { PrismaService } from '../../../village/prisma/prisma.service';
import { KafkaModule } from '../../../../libs/kafka/kafka.module';
@Module({
  imports: [KafkaModule],
  controllers: [ResourceController],
  providers: [ResourceService, PrismaService],
  exports:  [ResourceService],
})
export class ResourceModule {}
