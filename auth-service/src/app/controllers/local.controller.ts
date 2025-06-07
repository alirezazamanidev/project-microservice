import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';
import { PatternNameEnum } from 'src/common/enums/pattern.enum';
import {
  LocalLoginDto,
  LocalRegisterDto,
  VerifyOtpDto,
  UserDto,
} from 'src/common/interfaces/auth.interface';
import { LocalService } from 'src/app/services/local.service';
import { UserService } from 'src/app/services/user.service';

@Controller('local')
export class LocalController {
  constructor(
    private readonly localService: LocalService,
    private readonly userService: UserService,
  ) {}

  @MessagePattern(PatternNameEnum.LOCAL_LOGIN)
  async localLogin(@Payload() localLoginDto: LocalLoginDto) {
    return this.localService.localLogin(localLoginDto);
  }

  @MessagePattern(PatternNameEnum.LOCAL_REGISTER)
  async localRegister(@Payload() localRegisterDto: LocalRegisterDto) {
    return this.localService.localRegister(localRegisterDto);
  }

  @MessagePattern(PatternNameEnum.VERIFY_OTP)
  async verifyOtp(@Payload() verifyOtpDto: VerifyOtpDto) {
    return this.localService.verifyOtp(verifyOtpDto);
  }
  @MessagePattern(PatternNameEnum.GET_USER_INFO)
  async getUserInfo(@Payload() payload: { userId: string }) {
    return this.userService.getUserInfo(payload.userId);
  }

  
}
