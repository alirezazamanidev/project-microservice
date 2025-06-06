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
      description: 'Redirects user to Google OAuth consent screen',
    }),
  );
}

export function GoogleCallbackOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Google OAuth Callback',
      description: 'Handles Google OAuth callback and creates user session',
    }),
    ApiBadRequestResponse({
      description: 'Invalid authorization code or OAuth error',
    }),
  );
}

export function AppleAuthOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Apple OAuth Login',
      description: 'Redirects user to Apple OAuth consent screen',
    }),
  );
}

export function AppleCallbackOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Apple OAuth Callback',
      description: 'Handles Apple OAuth callback and creates user session',
    }),
    ApiBadRequestResponse({
      description: 'Invalid authorization code or OAuth error',
    }),
  );
}

export function LocalRegisterOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register new user account',
      description: 'Creates a new user account with email and full name',
    }),
    ApiConsumes('application/x-www-form-urlencoded', 'application/json'),
    ApiBody({ type: LocalRegisterDto }),
    ApiOkResponse({
      description: 'User registered successfully',
      schema: {
        example: {
          success: true,
          message: 'User registered successfully',
        },
      },
    }),
    ApiConflictResponse({
      description: 'User already exists',
      schema: {
        example: {
          success: false,
          error: {
            code: 'USER_ALREADY_EXISTS',
            message: 'User already exists',
            timestamp: '2023-01-01T00:00:00.000Z',
            path: '/auth/local/register',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid request - validation errors',
      schema: {
        example: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email format or missing required fields',
            timestamp: '2023-01-01T00:00:00.000Z',
            path: '/auth/local/register',
          },
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: {
        example: {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            timestamp: '2023-01-01T00:00:00.000Z',
            path: '/auth/local/register',
          },
        },
      },
    }),
  );
}

export function LocalLoginOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Send login otp to email',
      description:
        'Sends a 6-digit verification code to user email. Each email can only have one active code.',
    }),
    ApiConsumes('application/x-www-form-urlencoded', 'application/json'),
    ApiBody({ type: LocalLoginDto }),
    ApiOkResponse({
      description: 'OTP sent successfully',
      schema: {
        example: {
          success: true,
          message: 'OTP sent to your email successfully',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Account not found',
      schema: {
        example: {
          success: false,
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Account not found',
            timestamp: '2023-01-01T00:00:00.000Z',
            path: '/auth/local-login',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid request - incorrect email format',
      schema: {
        example: {
          success: false,
          error: {
            code: 'INVALID_EMAIL_FORMAT',
            message: 'Invalid email format',
            timestamp: '2023-01-01T00:00:00.000Z',
            path: '/auth/send-otp',
          },
        },
      },
    }),
    ApiTooManyRequestsResponse({
      description: 'OTP already sent',
      schema: {
        example: {
          success: false,
          error: {
            code: 'OTP_ALREADY_SENT',
            message: 'OTP already sent, please wait',
            timestamp: '2023-01-01T00:00:00.000Z',
            path: '/auth/send-otp',
          },
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Email sending error',
      schema: {
        example: {
          success: false,
          error: {
            code: 'EMAIL_SEND_ERROR',
            message: 'Failed to send email',
            timestamp: '2023-01-01T00:00:00.000Z',
            path: '/auth/local/login',
          },
        },
      },
    }),
  );
}

export function VerifyOtpOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify OTP Code',
      description:
        'Verifies the OTP code sent to email. Maximum 3 attempts allowed.',
    }),
    ApiConsumes('application/x-www-form-urlencoded', 'application/json'),
    ApiBody({ type: VerifyOtpDto }),
    ApiOkResponse({
      description: 'OTP code is valid',
      schema: {
        example: {
          success: true,
          message: 'OTP code is valid',
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid OTP format or email',
      schema: {
        example: {
          success: false,
          error: {
            code: 'INVALID_OTP_FORMAT',
            message: 'OTP code must be 6 digits',
            timestamp: '2023-01-01T00:00:00.000Z',
            path: '/auth/local/verify-otp',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired OTP',
      schema: {
        example: {
          success: false,
          error: {
            code: 'INVALID_OTP',
            message: 'Invalid or expired OTP code',
            timestamp: '2023-01-01T00:00:00.000Z',
            path: '/auth/verify-otp',
          },
        },
      },
    }),
  );
}

export function ProfileOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Current User Profile - Protected Route',
      description: 'Retrieves authenticated user profile information',
    }),
    ApiUnauthorizedResponse({
      description: 'User not authenticated',
    }),
    ApiOkResponse({
      description: 'Profile retrieved successfully',
      schema: {
        example: {
          success: true,
          message: 'Profile retrieved successfully',
          user: {
            userId: 'user@example.com',
            email: 'user@example.com',
            isAuthenticated: true,
          },
        },
      },
    }),
  );
}

export function LogoutOperation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Logout User and Destroy Session',
      description: 'Logs out user and destroys the session',
    }),
    ApiOkResponse({
      description: 'Logout successful',
      schema: {
        example: {
          success: true,
          message: 'Logged out successfully',
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Failed to logout',
      schema: {
        example: {
          success: false,
          message: 'Failed to logout',
        },
      },
    }),
  );
}
