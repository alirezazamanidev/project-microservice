import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';

interface StandardError {
  statusCode?: number;
  message: string;
  code?: string;
  details?: any;
}

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let error: StandardError;

    try {
      // The error from the microservice should be a standard object
      error = exception.getError() as StandardError;
    } catch (e) {
      // Fallback if getError() fails or returns a non-object
      this.logger.error('Failed to extract error from RpcException', e);
      error = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred in a downstream service.',
        code: 'INTERNAL_SERVICE_ERROR',
      };
    }

    const httpStatus = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        details: error.details || null,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      // Include the original error for debugging in development
      ...(process.env.NODE_ENV === 'development' && { debug: { ...error } }),
    };

    response.status(httpStatus).json(responseBody);
  }
}
