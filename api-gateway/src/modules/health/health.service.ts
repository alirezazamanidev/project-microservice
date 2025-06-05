import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  InjectAuthClient,
  InjectFileClient,
} from '../../common/decorators/inject-client.decorator';
import { timeout, catchError, of, firstValueFrom } from 'rxjs';

@Injectable()
export class HealthService {
  constructor(
    @InjectAuthClient() private readonly authClient: ClientProxy,
    @InjectFileClient() private readonly fileClient: ClientProxy,
  ) {}

  async checkHealth() {
    const services = await Promise.allSettled([
      this.checkAuthService(),
      this.checkFileService(),
    ]);

    return {
      status: services.every(
        (service) =>
          service.status === 'fulfilled' && service.value.status === 'healthy',
      )
        ? 'healthy'
        : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        auth:
          services[0].status === 'fulfilled'
            ? services[0].value
            : {
                status: 'unhealthy',
                error: (services[0] as PromiseRejectedResult).reason,
              },
        file:
          services[1].status === 'fulfilled'
            ? services[1].value
            : {
                status: 'unhealthy',
                error: (services[1] as PromiseRejectedResult).reason,
              },
      },
    };
  }

  private async checkAuthService() {
    try {
      await firstValueFrom(
        this.authClient.send('health.check', {}).pipe(
          timeout(5000),
          catchError(() => of({ status: 'unhealthy' })),
        ),
      );
      return { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  private async checkFileService() {
    try {
      await firstValueFrom(
        this.fileClient.send('health.check', {}).pipe(
          timeout(5000),
          catchError(() => of({ status: 'unhealthy' })),
        ),
      );
      return { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}
