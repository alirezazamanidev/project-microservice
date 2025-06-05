import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';
import { PatternNameEnum } from 'src/common/enums/pattern.enum';
import { SendOtpDto, VerifyOtpDto } from 'src/common/interfaces/auth.interface';
import { LocalService } from 'src/services/local.service';

@Controller('local')
export class LocalController {
  constructor(private readonly localService: LocalService) {}

  @MessagePattern(PatternNameEnum.SEND_OTP)
  async sendOtp(@Payload() sendOtpDto: SendOtpDto) {
    return this.localService.sendOtp(sendOtpDto);
  }

  @MessagePattern(PatternNameEnum.VERIFY_OTP)
  async verifyOtp(@Payload() verifyOtpDto: VerifyOtpDto) {
    return this.localService.verifyOtp(verifyOtpDto);
  }
}
