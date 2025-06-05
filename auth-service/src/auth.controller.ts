import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Payload } from '@nestjs/microservices';
import { MessagePattern } from '@nestjs/microservices';
import { PatternNameEnum } from './common/enums/pattern.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @MessagePattern(PatternNameEnum.GOOGLE_LOGIN)
  async googleLogin(@Payload() { code }: { code: string }) {
    return this.AuthService.googleLogin(code);
  }
}
