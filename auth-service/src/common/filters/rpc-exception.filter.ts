import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { ErrorResponse } from '../interfaces/auth.interface';
import { AuthErrorCodes } from '../enums/error-codes.enum';

@Catch()
export class RpcAllExceptionsFilter implements RpcExceptionFilter<any> {
  private readonly logger = new Logger(RpcAllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): Observable<any> {
    
    // Create standardized error response
    const errorResponse = this.createStandardizedError(exception);

    return throwError(() => errorResponse);
  }

  private createStandardizedError(exception: unknown): ErrorResponse {
    const timestamp = new Date().toISOString();

    if (exception instanceof RpcException) {
      const error = exception.getError() as any;

      // If error is already in our standardized format, return it
      if (
        typeof error === 'object' &&
        error !== null &&
        error.code &&
        error.statusCode &&
        error.timestamp
      ) {
        return error as ErrorResponse;
      }

      // If error is an object but not standardized, try to format it
      if (typeof error === 'object' && error !== null) {
        return {
          statusCode: error.statusCode || HttpStatus.BAD_REQUEST,
          message: error.message || 'RPC operation failed',
          code: error.code || AuthErrorCodes.INTERNAL_SERVER_ERROR,
          timestamp,
          details: error.details || undefined,
        };
      }

      // If error is a string or primitive
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: String(error),
        code: AuthErrorCodes.INTERNAL_SERVER_ERROR,
        timestamp,
      };
    }

    // Handle standard Error instances
    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        code: AuthErrorCodes.INTERNAL_SERVER_ERROR,
        timestamp,
        details:
          process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    // Handle unknown errors
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unknown error occurred',
      code: AuthErrorCodes.INTERNAL_SERVER_ERROR,
      timestamp,
      details: process.env.NODE_ENV === 'development' ? exception : undefined,
    };
  }
}
