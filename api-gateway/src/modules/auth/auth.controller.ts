import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Req,
  Res,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { Request, Response } from 'express';
import { AuthService } from './auth.service';
// Define session user interface
interface SessionUser {
  userId: string;
  email: string;
  isAuthenticated: boolean;
}
// Extend the session type to include our custom data
declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'google login' })
  @Get('google/login')
  async googleAuth(@Res() res: Response) {
    res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=profile email`,
    );
  }

  @ApiBadRequestResponse({ description: 'bad request' })
  @ApiOperation({ summary: 'google redirect route' })
  @Get('google/callback')
  async googleAuthRedirect(@Query('code') code: string, @Req() req: Request,@Res() res: Response) {
    const result = await this.authService.googleCallback(code);
    if (result) {
      req.session.user = {
        userId: result.id,
        email: result.email,
        isAuthenticated: true,
      };

      return res.redirect('http://localhost:3000/');
    }
    
  }
}
