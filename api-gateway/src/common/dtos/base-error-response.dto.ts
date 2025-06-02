// src/common/dtos/error-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'The HTTP status code.',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'A message of describing the error.',
    example: 'name should not be empty',
  })
  message: string 

  @ApiProperty({
    description: 'A short description of the error type.',
    example: 'Bad Request',
  })
  error: string;

  @ApiProperty({
    description: 'Timestamp of when the error occurred.',
    example: '2023-05-21T10:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'The path that was requested.',
    example: '/users',
  })
  path: string;
}