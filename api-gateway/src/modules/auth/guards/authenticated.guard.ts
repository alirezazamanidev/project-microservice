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

    // Check if session exists and has an ID
    if (!request?.session?.id) {
      throw new UnauthorizedException('Session not found. Please login again');
    }

    try {
      // Get user info from auth service using sessionId
      const userInfo = await lastValueFrom(
        this.authClient.send(PatternNameEnum.GET_USER_INFO, {
          sessionId: request.session.id,
        }),
      );

      if (!userInfo) {
        throw new UnauthorizedException('Invalid session. Please login again');
      }

      // Attach user info to request
      // request.user = userInfo;
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      throw new UnauthorizedException(
        'Authentication failed. Please login again',
      );
    }
  }
}
