import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectAuthClient } from '../../common/decorators/inject-client.decorator';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { PatternNameEnum } from 'src/common/enums/pattern.enum';
import { VerifyOtpDto, LocalLoginDto, LocalRegisterDto } from './dto/auth.dto';


export interface UserPayload {
  email: string;
  name?: string;
  picture?: string;
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
  async localLogin(localLoginDto: LocalLoginDto) {
    const result = await lastValueFrom(
      this.authClient.send(PatternNameEnum.LOCAL_LOGIN, localLoginDto),
    );
    return result;
  }

  async localRegister(localRegisterDto: LocalRegisterDto) {
    const result = await lastValueFrom(
      this.authClient.send(PatternNameEnum.LOCAL_REGISTER, localRegisterDto),
    );
    return result;
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const result = await lastValueFrom(
      this.authClient.send(PatternNameEnum.VERIFY_OTP, verifyOtpDto),
    );
    return result;
  }

  
}
