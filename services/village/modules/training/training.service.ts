import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrainingQueueService } from './training-queue.service';
import { BuildingType, TrainingTask } from '@prisma/client';
import { TROOP_TYPES } from '../../../../libs/types/troop-types';

@Injectable()
export class TrainingService {
  private readonly logger = new Logger(TrainingService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly trainingQueue: TrainingQueueService,
  ) {}

  async startTraining(
    villageId: string,
    troopId: string,
    troopType: string,
    buildingType: BuildingType,
    count: number,
    unitTimeMs: number,
  ): Promise<{ taskId: string; finishAt: Date }> {
    const building = await this.prisma.building.findFirst({
      where: { villageId, type: buildingType },
    });

    if (!building) throw new NotFoundException('Required building not found');

    const troopDef = TROOP_TYPES[troopType];

    if (!troopDef) throw new BadRequestException('Invalid troop type');

    if (building.level < troopDef.requiredLevel) {
      throw new BadRequestException(
        `Building level too low. Requires ${troopDef.requiredLevel}, has ${building.level}`,
      );
    }

    const existingTask = await this.prisma.trainingTask.findFirst({
      where: {
        villageId,
        buildingType,
        status: 'in_progress',
      },
    });

    const endTime = new Date(Date.now() + count * unitTimeMs);

    const data: any = {
      troopType,
      troopId,
      villageId,
      count,
      remaining: count,
      status: existingTask ? 'pending' : 'in_progress',
      endTime,
      queueJobId: '',
      buildingType,
    };

    if (!existingTask) {
      data.startTime = new Date();
    }

    const task = await this.prisma.trainingTask.create({ data });

    if (!existingTask) {
      const job = await this.trainingQueue.queueTraining(
        { taskId: task.id, buildTimeMs: unitTimeMs },
        unitTimeMs,
      );

      await this.prisma.trainingTask.update({
        where: { id: task.id },
        data: { queueJobId: job.id.toString() },
      });
    }

    return { taskId: task.id, finishAt: endTime };
  }

  async cancelTraining(taskId: string) {
    const task = await this.prisma.trainingTask.findUniqueOrThrow({
      where: { id: taskId },
    });

    if (task.status === 'completed')
      throw new Error('Cannot cancel completed task');

    await this.prisma.trainingTask.delete({ where: { id: taskId } });

    if (task.status === 'in_progress') {
      const next = await this.prisma.trainingTask.findFirst({
        where: {
          villageId: task.villageId,
          buildingType: task.buildingType,
          status: 'pending',
        },
        orderBy: { createdAt: 'asc' },
      });

      if (next) {
        const buildTimeMs =
          (task.endTime.getTime() - task.startTime.getTime()) / task.count;

        await this.prisma.trainingTask.update({
          where: { id: next.id },
          data: {
            status: 'in_progress',
            startTime: new Date(),
          },
        });

        const job = await this.trainingQueue.queueTraining(
          { taskId: next.id, buildTimeMs },
          buildTimeMs,
        );

        await this.prisma.trainingTask.update({
          where: { id: next.id },
          data: { queueJobId: job.id.toString() },
        });
      }
    }
  }

  async forceCompleteTask(taskId: string): Promise<void> {
    this.logger.log(`[forceCompleteTask] Forcing completion of task ${taskId}`);

    const task = await this.prisma.trainingTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      this.logger.warn(`[forceCompleteTask] Task not found: ${taskId}`);
      return;
    }

    if (task.status === 'completed') {
      this.logger.log(`[forceCompleteTask] Task ${taskId} already completed`);
      return;
    }

    const completedAmount = task.remaining;
    this.logger.log(
      `[forceCompleteTask] Completing ${completedAmount} x ${task.troopType}`,
    );

    const troop = await this.prisma.troop.findFirst({
      where: {
        villageId: task.villageId,
        troopType: task.troopType,
      },
    });

    if (troop) {
      await this.prisma.troop.update({
        where: { id: troop.id },
        data: {
          quantity: troop.quantity + completedAmount,
        },
      });
      this.logger.log(
        `[forceCompleteTask] Updated troop ${task.troopType} to ${troop.quantity + completedAmount}`,
      );
    } else {
      await this.prisma.troop.create({
        data: {
          villageId: task.villageId,
          troopType: task.troopType,
          quantity: completedAmount,
          status: 'idle',
        },
      });
      this.logger.log(
        `[forceCompleteTask] Created new troop ${task.troopType} with quantity ${completedAmount}`,
      );
    }

    await this.prisma.trainingTask.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        remaining: 0,
      },
    });

    await this.triggerNextTaskIfAvailable(task.villageId);
    this.logger.log(`[forceCompleteTask] Task ${taskId} marked as completed`);
  }

  private async startTask(task: TrainingTask): Promise<void> {
    const unitTimeMs =
      (task.endTime.getTime() - task.startTime.getTime()) / task.count;

    const job = await this.trainingQueue.queueTraining(
      {
        taskId: task.id,
        buildTimeMs: unitTimeMs,
      },
      unitTimeMs,
    );

    await this.prisma.trainingTask.update({
      where: { id: task.id },
      data: {
        status: 'in_progress',
        startTime: new Date(),
        queueJobId: job.id.toString(),
      },
    });

    this.logger.log(
      `[TrainingService] Started task ${task.id} (1/${task.remaining} x ${task.troopType})`,
    );
  }

  async triggerNextTaskIfAvailable(villageId: string) {
    const next = await this.prisma.trainingTask.findFirst({
      where: { villageId, status: 'pending' },
      orderBy: { createdAt: 'asc' },
    });

    if (next) {
      this.logger.log(
        `[TrainingService] Found pending task ${next.id}, triggering it.`,
      );
      await this.startTask(next);
    } else {
      this.logger.log(
        `[TrainingService] No pending training tasks found for village ${villageId}.`,
      );
    }
  }
}
