import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PatternNameEnum } from 'src/common/enums/pattern.enum';
import { UserDto } from 'src/common/interfaces/auth.interface';
import { GoogleService } from 'src/app/services/google.service';
import { UserService } from 'src/app/services/user.service';

@Controller('google')
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    
  ) {}

  @MessagePattern(PatternNameEnum.GOOGLE_LOGIN)
  async googleLogin(@Payload() { code,sessionId }: { code: string,sessionId:string }) {
    return this.googleService.googleLogin(code,sessionId);
  }
 
}
