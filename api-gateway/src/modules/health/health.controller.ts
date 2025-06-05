import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async checkHealth() {
    return this.healthService.checkHealth();
  }

  @Get('live')
  async liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  async readiness() {
    const health = await this.healthService.checkHealth();
    return {
      status: health.status === 'healthy' ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
    };
  }
}
