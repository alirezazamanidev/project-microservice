import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PatternNameEnum } from 'src/common/enums/pattern.enum';
import { AppleService } from 'src/app/services/apple.service';

@Controller('apple')
export class AppleController {
  constructor(private readonly appleService: AppleService) {}

  @MessagePattern(PatternNameEnum.APPLE_LOGIN)
  async appleLogin(
    @Payload() { code, state }: { code: string; state?: string },
  ) {
    return this.appleService.appleCallback(code, state);
  }
}
