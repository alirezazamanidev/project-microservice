import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectAuthClient } from '../../common/decorators/inject-client.decorator';
import { async, firstValueFrom, lastValueFrom } from 'rxjs';
import { PatternNameEnum } from 'src/common/enums/pattern.enum';

export interface SessionData {
  userId: string;
  email: string;
  isAuthenticated: boolean;
  loginTime: Date;
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
}
