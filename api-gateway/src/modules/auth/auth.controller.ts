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
  AppleCallbackOperation,
  VerifyOtpOperation,
  ProfileOperation,
  LogoutOperation,
  LocalLoginOperation,
  LocalRegisterOperation,
} from './decorators/auth-swagger.decorators';

@ApiTags('Auth')
@Controller('auth')
@UseFilters(RpcExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GoogleAuthOperation()
  @Get('google/login')
  async googleAuth(@Res() res: Response) {
    res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=profile email`,
    );
  }

  @GoogleCallbackOperation()
  @Get('google/callback')
  async googleAuthRedirect(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.googleCallback(code);
    if (result) {
      req.session.save(async (err) => {
        if (err) {
          console.error('❌ Session save error:', err);
          throw err;
        }

        const sessionId = req.sessionID;
        const userPayload = {
          userId: result.id,
          email: result.email,
          picture: result.picture || '',
          sessionId: sessionId,
        };

        await this.authService.saveUserPayload(userPayload);
      });

      return res.redirect('http://localhost:3000/');
    }
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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.appleCallback(code, state);
    if (result) {
      req.session.save(async (err) => {
        if (err) {
          console.error('❌ Session save error:', err);
          throw err;
        }

        const sessionId = req.sessionID;
        const userPayload = {
          userId: result.id,
          email: result.email,
          picture: result.picture || '',
          sessionId: sessionId,
        };

        await this.authService.saveUserPayload(userPayload);
      });

      return res.redirect('http://localhost:3000/');
    }
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
    @Body(ValidationPipe) verifyOtpDto: VerifyOtpDto,
    @Req() req: Request,
  ) {
    const result = await this.authService.verifyOtp(verifyOtpDto);
    const { user, ...other } = result;

    req.session.user = user;

    return new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          throw new UnauthorizedException('session save error');
        } else {
          resolve(other);
        }
      });
    });
  }

  // @IsAuthenticated()
  @ProfileOperation()
  @Get('profile')
  getProfile(@Req() req: Request) {
    return {
      success: true,
      message: 'Profile retrieved successfully',
      user: req.session.user,
    };
  }

  @IsAuthenticated()
  @LogoutOperation()
  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Session destroy error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to logout',
        });
      }

      res.clearCookie('sessionId');
      return res.json({
        success: true,
        message: 'Logged out successfully',
      });
    });
  }
}
