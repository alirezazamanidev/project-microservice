import { HttpStatus } from '@nestjs/common';
import { AuthErrorCodes, AuthErrorMessages } from '../enums/error-codes.enum';
import { ErrorResponse } from '../interfaces/auth.interface';

/**
 * Creates a standardized error response object
 * @param statusCode HTTP status code
 * @param code Error code from AuthErrorCodes enum
 * @param customMessage Optional custom message (defaults to predefined message)
 * @param details Optional additional error details
 * @returns Standardized ErrorResponse object
 */
export function createStandardError(
  statusCode: HttpStatus,
  code: AuthErrorCodes,
  customMessage?: string,
  details?: any,
): ErrorResponse {
  return {
    statusCode,
    code,
    message:
      customMessage ||
      AuthErrorMessages[code as keyof typeof AuthErrorMessages] ||
      'An error occurred',
    timestamp: new Date().toISOString(),
    details,
  };
}
