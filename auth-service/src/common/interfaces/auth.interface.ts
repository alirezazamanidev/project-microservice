export interface LocalLoginDto {
  email: string;
}

export interface LocalRegisterDto {
  email: string;
  fullname: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface OtpLoginDto {
  email: string;
  otp: string;
}

export interface OtpRecord {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  type: 'login' | 'register';
}

export interface EmailLoginResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  userInfo?: {
    email: string;
    name?: string;
  };
}

export interface UserDto {
  email: string;
  fullName: string;
  sessionId: string;
  picture?: string;
}

// Extended interfaces for session management
export interface UserPayload {
  email: string;
  fullName?: string;
  name?: string; // For compatibility with Google/Apple auth
  verifyEmail?: boolean;
  isVerified?: boolean; // For local auth after OTP verification
  picture?: string;
  sessionId?: string;
  created_at?: Date;
  updated_at?: Date;
  registeredAt?: Date;
}

export interface UserInfo {
  userId: string;
  email: string;
  fullName?: string;
  picture?: string;
  isVerified: boolean;
  sessionId?: string;
}

// Standardized Error Response Interfaces
export interface ErrorResponse {
  statusCode: number;
  message: string;
  code: string;
  timestamp: string;
  details?: any;
}

export interface ValidationErrorDetail {
  field: string;
  value: any;
  constraints: string[];
}

export interface ValidationError extends ErrorResponse {
  details: ValidationErrorDetail[];
}
