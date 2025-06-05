import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectAuthClient } from '../../common/decorators/inject-client.decorator';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { PatternNameEnum } from 'src/common/enums/pattern.enum';
import { SendOtpDto, VerifyOtpDto, EmailLoginDto } from './dto/otp.dto';

export interface SessionData {
  userId: string;
  email: string;
  isAuthenticated: boolean;
  loginTime: Date;
}

export interface UserPayload {
  userId: string;
  email: string;
  name?: string;
  picture?: string;
  sessionId: string;
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

@Injectable()
export class AuthService {
  constructor(@InjectAuthClient() private readonly authClient: ClientProxy) {}

  async googleCallback(code: string) {
    const result = await lastValueFrom(
      this.authClient.send(PatternNameEnum.GOOGLE_LOGIN, { code }),
    );

    return result;
  }

  async saveUserPayload(payload: UserPayload) {
    const result = await lastValueFrom(
      this.authClient.send(PatternNameEnum.SAVE_USER_PAYLOAD, payload),
    );
    return result;
  }

  // Email OTP Authentication Methods
  async sendOtp(sendOtpDto: SendOtpDto) {
    const result = await lastValueFrom(
      this.authClient.send(PatternNameEnum.SEND_OTP, sendOtpDto),
    );
    return result;
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const result = await lastValueFrom(
      this.authClient.send(PatternNameEnum.VERIFY_OTP, verifyOtpDto),
    );
    return result;
  }

  async emailLogin(emailLoginDto: EmailLoginDto): Promise<EmailLoginResponse> {
    const result = await lastValueFrom(
      this.authClient.send(PatternNameEnum.EMAIL_LOGIN, emailLoginDto),
    );
    return result;
  }
}
