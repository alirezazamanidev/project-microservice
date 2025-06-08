import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Req,
  Res,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  UseFilters,
  Session,
  UnauthorizedException,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { IsAuthenticated } from './decorators/auth.decorator';
import { VerifyOtpDto, LocalLoginDto, LocalRegisterDto } from './dto/auth.dto';
import { RpcExceptionFilter } from '../../common/filters/rpc-exception.filter';
import {
  GoogleAuthOperation,
  GoogleCallbackOperation,
  AppleAuthOperation,
  ProfileOperation,
  LogoutOperation,
  LocalLoginOperation,
  LocalRegisterOperation,
  VerifyOtpOperation,
  AppleCallbackOperation,
} from './decorators/auth-swagger.decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GoogleAuthOperation()
  @Get('google/login')
  googleAuth(@Res() res: Response) {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=profile email`;
    res.redirect(url);
  }

  @GoogleCallbackOperation()
  @Get('google/callback')
  async googleAuthRedirect(
    @Query('code') code: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const result = await this.authService.googleCallback(code);
    if (result) {
      session.user = {
        id: result.id,
        role: result.role,
        email: result.email,
      };
    }
    res.redirect('http://localhost:3000');
  }

  @AppleAuthOperation()
  @Get('apple/login')
  async appleAuth(@Res() res: Response) {
    const callbackUrl = process.env.APPLE_CALLBACK_URL || '';
    const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${process.env.APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=name email&response_mode=form_post`;
    res.redirect(appleAuthUrl);
  }

  @AppleCallbackOperation()
  @Post('apple/callback')
  async appleAuthRedirect(
    @Body('code') code: string,
    @Body('state') state: string,

    @Res() res: Response,
    @Session() session: Record<string, any>,
  ) {
    const result = await this.authService.appleCallback(code, state);
    if (result) {
      session.user = {
        id: result.id,
        role: result.role,
        email: result.email,
      };
    }
    res.redirect('http://localhost:3000');
  
  }

  @LocalLoginOperation()
  @Post('local/login')
  @HttpCode(HttpStatus.OK)
  localLogin(@Body(ValidationPipe) localLoginDto: LocalLoginDto) {
    return this.authService.localLogin(localLoginDto);
  }
  @LocalRegisterOperation()
  @Post('local/register')
  @HttpCode(HttpStatus.OK)
  localRegister(@Body(ValidationPipe) localRegisterDto: LocalRegisterDto) {
    return this.authService.localRegister(localRegisterDto);
  }
  @VerifyOtpOperation()
  @Post('local/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Session() session: Record<string, any>,
  ) {
    const result = await this.authService.verifyOtp(verifyOtpDto);
    const { user, ...other } = result;
    session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      ...other,
    };
  }

  @IsAuthenticated()
  @ProfileOperation()
  @Get('profile')
  getProfile(@Req() req: Request) {
    return {
      success: true,
      message: 'Profile retrieved successfully',
      user: req.user,
    };
  }

  @IsAuthenticated()
  @LogoutOperation()
  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Logout failed',
        });
      }

      res.clearCookie('connect.sid');
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logged out successfully',
      });
    });
  }
}
