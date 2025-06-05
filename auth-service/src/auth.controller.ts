import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Payload } from '@nestjs/microservices';
import { MessagePattern } from '@nestjs/microservices';
import { PatternNameEnum } from './common/enums/pattern.enum';

interface UserPayload {
  userId: string;
  email: string;
  name?: string;
  picture?: string;
  sessionId: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @MessagePattern(PatternNameEnum.GOOGLE_LOGIN)
  async googleLogin(@Payload() { code }: { code: string }) {
    return this.AuthService.googleLogin(code);
  }

  @MessagePattern(PatternNameEnum.SAVE_USER_PAYLOAD)
  async saveUserPayload(@Payload() payload: UserPayload) {
    return this.AuthService.saveUserPayload(payload);
  }

  // @MessagePattern(PatternNameEnum.GET_USER_INFO)
  // async getUserPayloadBySession(
  //   @Payload() { sessionId }: { sessionId: string },
  // ) {
  //   return this.AuthService.getUserPayloadBySession(sessionId);
  // }

  // @MessagePattern('auth/delete-session')
  // async deleteUserSession(@Payload() { sessionId }: { sessionId: string }) {
  //   return this.AuthService.deleteUserSession(sessionId);
  // }

  // @MessagePattern('auth/get-active-sessions')
  // async getAllActiveSessions() {
  //   return this.AuthService.getAllActiveSessions();
  // }
}
