import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class RpcAllExceptionsFilter implements RpcExceptionFilter<any> {
  private readonly logger = new Logger(RpcAllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): Observable<any> {

    if (exception instanceof RpcException) {
      const error = exception.getError();

      if (typeof error === 'object' && error !== null) {
        return throwError(() => error);
      }
      return throwError(() => ({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      }));
    } else if (exception instanceof Error) {
      return throwError(() => ({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        stack: exception.stack,
      }));
    }

    return throwError(() => ({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unknown error occurred',
      error: exception,
    }));
  }
}
