import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiTooManyRequestsResponse,
  ApiInternalServerErrorResponse,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { VerifyOtpDto, LocalLoginDto, LocalRegisterDto } from '../dto/auth.dto';

export function GoogleAuthOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Google OAuth Login',
      description:
        'Redirects user to Google OAuth consent screen for authentication',
    }),
    ApiOkResponse({
      description: 'Redirects to Google OAuth consent screen',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Redirecting to Google OAuth...',
          },
        },
      },
    }),
  );
}

export function GoogleCallbackOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Google OAuth Callback',
      description:
        'Handles Google OAuth callback, creates user session, and redirects to frontend',
    }),
    ApiOkResponse({
      description: 'OAuth successful, user session created and redirected',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Authentication successful, redirecting...',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid authorization code or OAuth error',
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
            example: 'Invalid authorization code or OAuth error',
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
            example: '/auth/google/callback',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
  );
}

export function AppleAuthOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Apple OAuth Login',
      description:
        'Redirects user to Apple OAuth consent screen for authentication',
    }),
    ApiOkResponse({
      description: 'Redirects to Apple OAuth consent screen',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Redirecting to Apple OAuth...',
          },
        },
      },
    }),
  );
}

export function AppleCallbackOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Apple OAuth Callback',
      description:
        'Handles Apple OAuth callback, creates user session, and redirects to frontend',
    }),
    ApiOkResponse({
      description: 'OAuth successful, user session created and redirected',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Authentication successful, redirecting...',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid authorization code or OAuth error',
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
            example: 'Invalid authorization code or OAuth error',
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
            example: '/auth/apple/callback',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
  );
}

export function LocalRegisterOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register New User Account',
      description:
        'Creates a new user account with email and full name. Returns success confirmation.',
    }),
    ApiConsumes('application/x-www-form-urlencoded', 'application/json'),
    ApiBody({ type: LocalRegisterDto }),
    ApiOkResponse({
      description: 'User registered successfully',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
            description: 'Registration success status',
          },
          message: {
            type: 'string',
            example: 'User registered successfully',
            description: 'Success confirmation message',
          },
        },
        required: ['success', 'message'],
      },
    }),
    ApiConflictResponse({
      description: 'User already exists with this email',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 409,
            description: 'HTTP status code',
          },
          message: {
            type: 'string',
            example: 'User already exists with this email address',
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
            example: '/auth/local/register',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid request - validation errors',
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
            example: 'Invalid email format or missing required fields',
            description: 'Error message',
          },
          details: {
            type: 'object',
            properties: {
              validationErrors: {
                type: 'array',
                items: { type: 'string' },
                example: [
                  'email must be a valid email',
                  'fullName should not be empty',
                ],
                description: 'List of validation errors',
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
            example: '/auth/local/register',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error during registration',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 500,
            description: 'HTTP status code',
          },
          message: {
            type: 'string',
            example: 'An internal server error occurred.',
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
            example: '/auth/local/register',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
  );
}

export function LocalLoginOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Send Login OTP to Email',
      description:
        'Sends a 6-digit verification code to user email for login. Each email can only have one active code at a time.',
    }),
    ApiConsumes('application/x-www-form-urlencoded', 'application/json'),
    ApiBody({ type: LocalLoginDto }),
    ApiOkResponse({
      description: 'OTP sent successfully to user email',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
            description: 'OTP sending success status',
          },
          message: {
            type: 'string',
            example: 'OTP sent to your email successfully',
            description: 'Success confirmation message',
          },
        },
        required: ['success', 'message'],
      },
    }),
    ApiNotFoundResponse({
      description: 'Account not found with provided email',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 404,
            description: 'HTTP status code',
          },
          message: {
            type: 'string',
            example: 'No account found with this email address',
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
            example: '/auth/local/login',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid request - incorrect email format',
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
            example: 'Please provide a valid email address',
            description: 'Error message',
          },
          details: {
            type: 'object',
            properties: {
              validationErrors: {
                type: 'array',
                items: { type: 'string' },
                example: ['email must be a valid email'],
                description: 'List of validation errors',
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
            example: '/auth/local/login',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
    ApiTooManyRequestsResponse({
      description: 'OTP already sent, please wait before requesting again',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 429,
            description: 'HTTP status code',
          },
          message: {
            type: 'string',
            example:
              'OTP already sent to this email, please wait before requesting again',
            description: 'Error message',
          },
          details: {
            type: 'object',
            properties: {
              retryAfter: {
                type: 'number',
                example: 300,
                description: 'Seconds to wait before retrying',
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
            example: '/auth/local/login',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Email sending error or server error',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 500,
            description: 'HTTP status code',
          },
          message: {
            type: 'string',
            example: 'An internal server error occurred.',
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
            example: '/auth/local/login',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
  );
}

export function VerifyOtpOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify OTP Code',
      description:
        'Verifies the OTP code sent to email and creates user session. Maximum 3 attempts allowed per OTP.',
    }),
    ApiConsumes('application/x-www-form-urlencoded', 'application/json'),
    ApiBody({ type: VerifyOtpDto }),
    ApiOkResponse({
      description: 'OTP verified successfully, user session created',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
            description: 'OTP verification success status',
          },
          message: {
            type: 'string',
            example: 'OTP verified successfully',
            description: 'Success confirmation message',
          },
        },
        required: ['success', 'message'],
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid OTP format or email',
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
            example: 'OTP code must be exactly 6 digits',
            description: 'Error message',
          },
          details: {
            type: 'object',
            properties: {
              validationErrors: {
                type: 'array',
                items: { type: 'string' },
                example: [
                  'otp must be exactly 6 digits',
                  'email must be a valid email',
                ],
                description: 'List of validation errors',
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
            example: '/auth/local/verify-otp',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired OTP code',
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
            example: 'Invalid or expired OTP code. Please request a new one.',
            description: 'Error message',
          },
          details: {
            type: 'object',
            properties: {
              attemptsRemaining: {
                type: 'number',
                example: 2,
                description: 'Number of verification attempts remaining',
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
            example: '/auth/local/verify-otp',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
  );
}

export function ProfileOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Current User Profile - Protected Route',
      description:
        'Retrieves authenticated user profile information from session',
    }),
    ApiOkResponse({
      description: 'Profile retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
            description: 'Profile retrieval success status',
          },
          message: {
            type: 'string',
            example: 'Profile retrieved successfully',
            description: 'Success confirmation message',
          },
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: 'user@example.com',
                description: 'User unique identifier',
              },
              email: {
                type: 'string',
                example: 'user@example.com',
                description: 'User email address',
              },
              role: {
                type: 'string',
                example: 'user',
                description: 'User role',
              },
            },
            required: ['id', 'email', 'role'],
          },
        },
        required: ['success', 'message', 'user'],
      },
    }),
    ApiUnauthorizedResponse({
      description: 'User not authenticated or session expired',
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
            example: 'User not authenticated. Please login first.',
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
            example: '/auth/profile',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
  );
}

export function LogoutOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Logout User and Destroy Session',
      description: 'Logs out user, destroys the session, and clears cookies',
    }),
    ApiOkResponse({
      description: 'Logout successful',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
            description: 'Logout success status',
          },
          message: {
            type: 'string',
            example: 'Logged out successfully',
            description: 'Success confirmation message',
          },
        },
        required: ['success', 'message'],
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Failed to logout - session destruction error',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 500,
            description: 'HTTP status code',
          },
          message: {
            type: 'string',
            example: 'An internal server error occurred.',
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
            example: '/auth/logout',
            description: 'Request path where error occurred',
          },
        },
        required: ['statusCode', 'message', 'details', 'timestamp', 'path'],
      },
    }),
  );
}
