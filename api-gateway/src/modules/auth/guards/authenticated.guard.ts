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

    if (!request.session || !request.session.user)
      throw new UnauthorizedException('login again');

    const result = await lastValueFrom(
      this.authClient.send(PatternNameEnum.GET_USER_INFO, {
        userId: request.session.user.id,
      }),
    );
    if(request) request.user=result
    return true;
  }
}
