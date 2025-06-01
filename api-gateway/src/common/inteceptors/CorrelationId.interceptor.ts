import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
import { randomUUID } from 'crypto';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  
  @Injectable()
  export class CorrelationIdInterceptor implements NestInterceptor {
    private readonly logger = new Logger(CorrelationIdInterceptor.name);
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const ctxType = context.getType();
      const correlationId = randomUUID()
  
      if (ctxType === 'rpc') {
        const rpc = context.switchToRpc();
        const data = rpc.getData();
        data.correlationId = correlationId;
  
        this.logger.log(`📤 Sending message with correlationId: ${correlationId}`);
      }
  
      return next.handle().pipe(
        tap(() => {
          this.logger.log(`📥 Received response for correlationId: ${correlationId}`);
        }),
      );
    }
  }
  