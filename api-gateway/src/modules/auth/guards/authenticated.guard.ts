import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';
import { InjectAuthClient } from 'src/common/decorators/inject-client.decorator';
import { PatternNameEnum } from 'src/common/enums/pattern.enum';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    // Check if sessionID exists
    if (!request?.session?.id)
      throw new UnauthorizedException('Session not found. Please login again');
    const payload = await lastValueFrom(
      this.authClient.send(PatternNameEnum.GET_USER_INFO, {
       
      }),
    );
    if (!payload) {
      throw new UnauthorizedException('Invalid session. Please login again');
    }

    request.user = payload;
    return true;
  }
}
