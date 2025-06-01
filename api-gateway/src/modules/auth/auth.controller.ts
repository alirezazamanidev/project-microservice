import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IsAuthenticated } from './decorators/auth.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'google login' })
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return { message: 'Redirecting to Google for authentication' };
  }

  @ApiOperation({ summary: 'google redirect route' })
  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  async googleAuthRedirect(@Req() req: Request) {
    if (!req?.user) throw new UnauthorizedException('login failed!');
    await new Promise<void>((resolve, reject) => {
      req.logIn(req.user!, (err) => {
        if (err) reject(new UnauthorizedException('login failed'));
        else resolve();
      });
    });

    return { message: 'logged In successFully' };
  }
  @IsAuthenticated()
  @ApiOperation({ summary: 'user payload' })
  @Get('payload')
  payload(@Req() req: Request) {
    return req.user;
  }
}
