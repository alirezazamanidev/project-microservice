import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { PatternNameEnum } from "src/common/enums/pattern.enum";
import { GoogleService } from "src/services/google.service";

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

@MessagePattern(PatternNameEnum.GOOGLE_LOGIN)
async googleLogin(@Payload() { code }: { code: string }) {
  return this.googleService.googleLogin(code);
}

}