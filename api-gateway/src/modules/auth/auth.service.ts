import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectAuthClient } from '../../common/decorators/inject-client.decorator';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { PatternNameEnum } from 'src/common/enums/pattern.enum';

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
}
