import {
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  HealthCheckService,
  HealthCheckResult,
  HealthCheck,
} from '@nestjs/terminus';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/**
 * [description]
 */
@ApiTags('status')
@Controller('status')
export class AppController {
  /**
   * [description]
   * @param typeorm
   * @param memory
   * @param health
   */
  constructor(
    private readonly typeorm: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly health: HealthCheckService,
  ) {}

  /**
   * [description]
   */
  @Get()
  @HealthCheck()
  public status(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 2 ** 31),
      () => this.memory.checkRSS('memory_rss', 2 ** 31),
      () => this.typeorm.pingCheck('database'),
    ]);
  }
}
