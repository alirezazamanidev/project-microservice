// rpc-error.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  Observable,
  TimeoutError,
  catchError,
  throwError,
  timeout,
} from 'rxjs';

@Injectable()
export class RpcErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    
    

    return next.handle().pipe(
      timeout(60000),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          return throwError(
            () =>
              new HttpException('service timeout', HttpStatus.GATEWAY_TIMEOUT),
          );
        }
        if (error?.statusCode && error?.message) {
          return throwError(
            () => new HttpException(error.message, error.statusCode),
          );
        }
        return throwError(
          () => new HttpException('Unknown error from microservice', 500),
        );
      }),
    );
  }
}
