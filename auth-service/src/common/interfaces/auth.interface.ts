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

export interface UserPayload {
  email: string;
  name?: string;
  picture?: string;
  isVerified?: boolean;
  registeredAt?: Date;
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
