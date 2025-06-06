import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';

interface RpcError {
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
    const request = ctx.getRequest();

    let error: RpcError;

    try {
      error = exception.getError() as RpcError;
    } catch {
      // Fallback if getError() fails
      error = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      };
    }

    const httpStatus = this.mapRpcToHttpStatus(error);
    const errorResponse = this.buildErrorResponse(error, request);

    response.status(httpStatus).json(errorResponse);
  }

  private mapRpcToHttpStatus(error: RpcError): number {
    // Default to provided status code or 500
    if (error.statusCode) {
      return error.statusCode;
    }

    // Map common error codes to HTTP status codes
    const codeToStatusMap: Record<string, number> = {
      // Authentication errors
      GOOGLE_AUTH_ERROR: HttpStatus.UNAUTHORIZED,
      APPLE_AUTH_ERROR: HttpStatus.UNAUTHORIZED,
      PROFILE_FETCH_ERROR: HttpStatus.UNAUTHORIZED,
      INVALID_OTP: HttpStatus.UNAUTHORIZED,
      OTP_EXPIRED: HttpStatus.UNAUTHORIZED,
      MAX_OTP_ATTEMPTS_EXCEEDED: HttpStatus.TOO_MANY_REQUESTS,

      // Validation errors
      INVALID_EMAIL_FORMAT: HttpStatus.BAD_REQUEST,
      INVALID_OTP_FORMAT: HttpStatus.BAD_REQUEST,
      MISSING_REQUIRED_FIELDS: HttpStatus.BAD_REQUEST,

      // Rate limiting
      OTP_ALREADY_SENT: HttpStatus.TOO_MANY_REQUESTS,

      // Server errors
      EMAIL_SEND_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
      SESSION_SAVE_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
      SESSION_RETRIEVE_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
      OTP_SEND_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
      OTP_VERIFY_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
      LOGIN_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
      INTERNAL_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    return (
      codeToStatusMap[error.code || ''] || HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  private buildErrorResponse(error: RpcError, request: any) {
    const timestamp = new Date().toISOString();
    const path = request.url;

    // Build user-friendly messages
    const userFriendlyMessages: Record<string, string> = {
      // English messages for better UX
      GOOGLE_AUTH_ERROR: 'Error in Google authentication',
      PROFILE_FETCH_ERROR: 'Error retrieving user profile',
      INVALID_OTP: 'Invalid or expired verification code',
      OTP_EXPIRED: 'Verification code has expired',
      MAX_OTP_ATTEMPTS_EXCEEDED: 'Maximum verification attempts exceeded',
      INVALID_EMAIL_FORMAT: 'Invalid email format',
      INVALID_OTP_FORMAT: 'Verification code must be 6 digits',
      MISSING_REQUIRED_FIELDS: 'Required fields are incomplete',
      OTP_ALREADY_SENT: 'Verification code already sent, please wait',
      EMAIL_SEND_ERROR: 'Error sending email',
      SESSION_SAVE_ERROR: 'Error saving session',
      SESSION_RETRIEVE_ERROR: 'Error retrieving session information',
      OTP_SEND_ERROR: 'Error sending verification code',
      OTP_VERIFY_ERROR: 'Error verifying code',
      LOGIN_ERROR: 'Error in login process',
      INTERNAL_ERROR: 'Internal server error',
    };

    const userMessage = userFriendlyMessages[error.code || ''] || error.message;

    return {
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: userMessage,
        details: error.details || null,
        timestamp,
        path,
      },
      // Include original technical message in development
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          originalMessage: error.message,
          statusCode: error.statusCode,
        },
      }),
    };
  }
}
