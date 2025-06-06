import { HttpStatus } from '@nestjs/common';
import { FileErrorCodes } from '../enums/error-codes.enum';

export interface ErrorResponse {
  statusCode: HttpStatus;
  code: FileErrorCodes;
  message: string;
  timestamp: string;
  details?: any;
}
