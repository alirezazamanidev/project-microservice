export interface SendOtpDto {
  email: string;
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
  userId: string;
  email: string;
  name?: string;
  picture?: string;
  sessionId: string;
}
