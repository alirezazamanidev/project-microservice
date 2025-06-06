import { HttpStatus } from '@nestjs/common';
import { FileErrorCodes, FileErrorMessages } from '../enums/error-codes.enum';
import { ErrorResponse } from '../interfaces/error.interface';

/**
 * Creates a standardized error response object for the file service
 * @param statusCode HTTP status code
 * @param code Error code from FileErrorCodes enum
 * @param customMessage Optional custom message (defaults to predefined message)
 * @param details Optional additional error details
 * @returns Standardized ErrorResponse object
 */
export function createStandardError(
  statusCode: HttpStatus,
  code: FileErrorCodes,
  customMessage?: string,
  details?: any,
): ErrorResponse {
  return {
    statusCode,
    code,
    message:
      customMessage ||
      FileErrorMessages[code as keyof typeof FileErrorMessages] ||
      'An error occurred in the file service',
    timestamp: new Date().toISOString(),
    details,
  };
}
