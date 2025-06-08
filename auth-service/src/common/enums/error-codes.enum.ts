export enum AuthErrorCodes {
  // Authentication Errors
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCESS_DENIED = 'ACCESS_DENIED',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // OTP Related Errors
  OTP_EXPIRED = 'OTP_EXPIRED',
  OTP_INVALID = 'OTP_INVALID',
  OTP_ALREADY_SENT = 'OTP_ALREADY_SENT',
  OTP_SEND_ERROR = 'OTP_SEND_ERROR',
  OTP_SAVE_ERROR = 'OTP_SAVE_ERROR',
  OTP_VERIFY_ERROR = 'OTP_VERIFY_ERROR',
  MAX_OTP_ATTEMPTS_EXCEEDED = 'MAX_OTP_ATTEMPTS_EXCEEDED',

  // Registration Errors
  REGISTRATION_EXPIRED = 'REGISTRATION_EXPIRED',
  REGISTRATION_PROCESS_ERROR = 'REGISTRATION_PROCESS_ERROR',

  // Email Errors
  EMAIL_SEND_ERROR = 'EMAIL_SEND_ERROR',
  EMAIL_INVALID = 'EMAIL_INVALID',

  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_INPUT_FORMAT = 'INVALID_INPUT_FORMAT',

  // Rate Limiting
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // System Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  LOGOUT_ERROR = 'LOGOUT_ERROR',

  // Google Auth Errors
  GOOGLE_AUTH_ERROR = 'GOOGLE_AUTH_ERROR',
  GOOGLE_TOKEN_INVALID = 'GOOGLE_TOKEN_INVALID',

  // Apple Auth Errors
  APPLE_AUTH_ERROR = 'APPLE_AUTH_ERROR',
  APPLE_TOKEN_INVALID = 'APPLE_TOKEN_INVALID',

  // Token Errors
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
}

export enum AuthErrorMessages {
  // Authentication Messages
  ACCOUNT_NOT_FOUND = 'Account not found. Please check your email or register a new account.',
  ACCOUNT_NOT_VERIFIED = 'Account not verified. Please complete registration first.',
  USER_ALREADY_EXISTS = 'User already exists with this email address.',
  INVALID_CREDENTIALS = 'Invalid credentials provided.',
  ACCESS_DENIED = 'Access denied. You do not have permission to perform this action.',
  UNAUTHORIZED = 'Unauthorized access. Please login to continue.',

  // OTP Messages
  OTP_EXPIRED = 'OTP code has expired. Please request a new one.',
  OTP_INVALID = 'Invalid OTP code. Please check and try again.',
  OTP_ALREADY_SENT = 'OTP already sent. Please wait before requesting a new one.',
  OTP_SEND_ERROR = 'Failed to send OTP. Please try again later.',
  OTP_SAVE_ERROR = 'Failed to save OTP. Please try again.',
  OTP_VERIFY_ERROR = 'Failed to verify OTP. Please try again.',
  MAX_OTP_ATTEMPTS_EXCEEDED = 'Maximum OTP attempts exceeded. Please request a new OTP.',

  // Registration Messages
  REGISTRATION_EXPIRED = 'Registration data expired. Please register again.',
  REGISTRATION_PROCESS_ERROR = 'Failed to process registration. Please try again.',

  // Email Messages
  EMAIL_SEND_ERROR = 'Failed to send email. Please check your email address and try again.',
  EMAIL_INVALID = 'Invalid email address format.',

  // Validation Messages
  VALIDATION_ERROR = 'Validation failed. Please check your input.',
  MISSING_REQUIRED_FIELD = 'Required field is missing.',
  INVALID_INPUT_FORMAT = 'Invalid input format.',

  // Rate Limiting Messages
  TOO_MANY_REQUESTS = 'Too many requests. Please try again later.',
  RATE_LIMIT_EXCEEDED = 'Rate limit exceeded. Please wait before making another request.',

  // System Messages
  INTERNAL_SERVER_ERROR = 'Internal server error. Please try again later.',
  SERVICE_UNAVAILABLE = 'Service is temporarily unavailable. Please try again later.',
  DATABASE_ERROR = 'Database error occurred. Please try again later.',
  CACHE_ERROR = 'Cache error occurred. Please try again later.',
  LOGOUT_ERROR = 'Failed to logout. Please try again.',

  // Google Auth Messages
  GOOGLE_AUTH_ERROR = 'Google authentication failed. Please try again.',
  GOOGLE_TOKEN_INVALID = 'Invalid Google token.',

  // Apple Auth Messages
  APPLE_AUTH_ERROR = 'Apple authentication failed. Please try again.',
  APPLE_TOKEN_INVALID = 'Invalid Apple token.',

  // Token Messages
  TOKEN_EXPIRED = 'Token has expired. Please login again.',
  TOKEN_INVALID = 'Invalid token provided.',
  REFRESH_TOKEN_INVALID = 'Invalid refresh token.',
}
