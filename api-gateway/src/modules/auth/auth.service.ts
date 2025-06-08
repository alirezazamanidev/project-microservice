import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectAuthClient } from '../../common/decorators/inject-client.decorator';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { PatternNameEnum } from 'src/common/enums/pattern.enum';
import { VerifyOtpDto, LocalLoginDto, LocalRegisterDto } from './dto/auth.dto';
import { Session } from 'express-session';

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

  async appleCallback(code: string, state?: string) {
    const result = await lastValueFrom(
      this.authClient.send(PatternNameEnum.APPLE_LOGIN, { code, state }),
    );

    return result;
  }

  async saveOrUpdateUser(userDto: {
    sessionId: string;
    email: string;
    fullname: string;
    picture: string;
  }) {
    // const result=await lastValueFrom(
    //   // this.authClient.send(PatternNameEnum.CREATE_OR_UPDATE_USER,userDto)
    // )
    // return result
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

  async logout(userId: string) {
    const result = await lastValueFrom(
      this.authClient.send(PatternNameEnum.LOGOUT, { userId }),
    );
    return result;
  }
}
