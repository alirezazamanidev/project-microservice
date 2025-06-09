import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiGatewayTimeoutResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { UploadFileDto } from '../dtos/upload-file.dto';
import { FileDto, PresignedFileDto } from '../dtos/file.dto';
import { ErrorResponseDto } from 'src/common/dtos/base-error-response.dto';

export function FileUploadOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload File',
      description:
        'Upload a file with allowed formats (image/png, image/jpeg, application/pdf) up to 10MB. The uploaded file is stored on the server and its information is returned.',
    }),
    ApiBody({ type: UploadFileDto }),
    ApiConsumes('multipart/form-data'),
    ApiOkResponse({
      description: 'File uploaded successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'uploaded file successFully',
            description: 'Success confirmation message for file upload',
          },
          data: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                example: 'uploads/images/profile_12345.png',
                description: 'File storage path on the server',
              },
              size: {
                type: 'number',
                example: 204800,
                description: 'File size in bytes',
              },
              mimetype: {
                type: 'string',
                example: 'image/png',
                description: 'File MIME type',
              },
              originalname: {
                type: 'string',
                example: 'avatar.png',
                description: 'Original filename uploaded by user',
              },
            },
            required: ['filePath', 'size', 'mimetype', 'originalname'],
          },
        },
        required: ['message', 'data'],
      },
    }),
    ApiUnauthorizedResponse({
      description: 'User not authenticated',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 401,
            description: 'HTTP status code',
          },
          message: {
            type: 'string',
            example: 'User not authenticated',
            description: 'Error message',
          },
          details: {
            type: 'object',
            example: {},
            description: 'Additional error details',
          },
          timestamp: {
            type: 'string',
            example: '2023-01-01T00:00:00.000Z',
            description: 'Error timestamp in ISO format',
          },
          path: {
            type: 'string',
            example: '/file/upload',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
    ApiGatewayTimeoutResponse({
      description: 'File service timeout',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 504,
            description: 'HTTP status code',
          },
          message: {
            type: 'string',
            example: 'Gateway timeout - File service is not responding',
            description: 'Error message',
          },
          details: {
            type: 'object',
            example: {},
            description: 'Additional error details',
          },
          timestamp: {
            type: 'string',
            example: '2023-01-01T00:00:00.000Z',
            description: 'Error timestamp in ISO format',
          },
          path: {
            type: 'string',
            example: '/file/upload',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
    ApiBadRequestResponse({
      description:
        'Invalid request - Invalid file type, size exceeds limit, or missing file',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 400,
            description: 'HTTP status code',
          },
          message: {
            type: 'string',
            example: 'Invalid file type',
            description: 'Error message',
          },
          details: {
            type: 'object',
            properties: {
              allowedTypes: {
                type: 'array',
                items: { type: 'string' },
                example: ['image/png', 'image/jpeg', 'application/pdf'],
                description: 'List of allowed file types',
              },
              maxSize: {
                type: 'string',
                example: '10MB',
                description: 'Maximum allowed file size',
              },
            },
            description: 'Additional error details',
          },
          timestamp: {
            type: 'string',
            example: '2023-01-01T00:00:00.000Z',
            description: 'Error timestamp in ISO format',
          },
          path: {
            type: 'string',
            example: '/file/upload',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
  );
}

export function FileListOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'List User Files',
      description:
        'Retrieve list of all files uploaded by the authenticated user with temporary URLs for file access',
    }),
    ApiOkResponse({
      description: 'User files list retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'list files user',
            description: 'Success confirmation message for file list retrieval',
          },
          data: {
            type: 'array',
            description: 'Array of user uploaded files',
            items: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  example: 'uploads/image.png',
                  description: 'Internal file path on server or storage system',
                },
                size: {
                  type: 'number',
                  example: 204800,
                  description: 'File size in bytes',
                },
                mimetype: {
                  type: 'string',
                  example: 'image/png',
                  description: 'File MIME type',
                },
                originalname: {
                  type: 'string',
                  example: 'my-image.png',
                  description: 'Original filename uploaded by user',
                },
                url: {
                  type: 'string',
                  example:
                    'https://s3.amazonaws.com/bucket/uploads/image.png?signature=...',
                  description:
                    'Temporary pre-signed URL for file access or download',
                },
                expiresAt: {
                  type: 'string',
                  example: '2025-06-02T12:34:56.000Z',
                  description:
                    'Exact expiration time of the pre-signed URL (ISO format)',
                },
                expires_in_seconds: {
                  type: 'number',
                  example: 3600,
                  description: 'Remaining time before URL expires in seconds',
                },
                lastModified: {
                  type: 'string',
                  example: '2025-05-31T10:22:00.000Z',
                  description:
                    'Last modified timestamp of the file (ISO format)',
                },
              },
              required: [
                'filePath',
                'size',
                'mimetype',
                'originalname',
                'url',
                'expiresAt',
                'expires_in_seconds',
                'lastModified',
              ],
            },
          },
        },
        required: ['message', 'data'],
      },
    }),
    ApiUnauthorizedResponse({
      description: 'User not authenticated',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 401,
            description: 'HTTP status code',
          },
          message: {
            type: 'string',
            example: 'User not authenticated',
            description: 'Error message',
          },
          details: {
            type: 'object',
            example: {},
            description: 'Additional error details',
          },
          timestamp: {
            type: 'string',
            example: '2023-01-01T00:00:00.000Z',
            description: 'Error timestamp in ISO format',
          },
          path: {
            type: 'string',
            example: '/file/list',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
    ApiGatewayTimeoutResponse({
      description: 'File service timeout',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 504,
            description: 'HTTP status code',
          },
          message: {
            type: 'string',
            example: 'Gateway timeout - File service is not responding',
            description: 'Error message',
          },
          details: {
            type: 'object',
            example: {},
            description: 'Additional error details',
          },
          timestamp: {
            type: 'string',
            example: '2023-01-01T00:00:00.000Z',
            description: 'Error timestamp in ISO format',
          },
          path: {
            type: 'string',
            example: '/file/list',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid request parameters',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 400,
            description: 'HTTP status code',
          },
          message: {
            type: 'string',
            example: 'Invalid request parameters',
            description: 'Error message',
          },
          details: {
            type: 'object',
            example: {},
            description: 'Additional error details',
          },
          timestamp: {
            type: 'string',
            example: '2023-01-01T00:00:00.000Z',
            description: 'Error timestamp in ISO format',
          },
          path: {
            type: 'string',
            example: '/file/list',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
  );
}
