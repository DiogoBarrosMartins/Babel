import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @EventPattern('village.building.started')
  handleBuildingStart(@Payload() data: any) {
    console.log('Building started:', data);
    // TODO: check resources, start build, emit success
  }
}
