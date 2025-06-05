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
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiTooManyRequestsResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { IsAuthenticated } from './decorators/auth.decorator';
import { SendOtpDto, VerifyOtpDto, EmailLoginDto } from './dto/otp.dto';
import { RpcExceptionFilter } from '../../common/filters/rpc-exception.filter';
import {
  GoogleAuthOperation,
  GoogleCallbackOperation,
  SendOtpOperation,
  VerifyOtpOperation,
  EmailLoginOperation,
  ProfileOperation,
  LogoutOperation,
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

  @SendOtpOperation()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body(ValidationPipe) sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto);
  }

  @VerifyOtpOperation()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body(ValidationPipe) verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @EmailLoginOperation()
  @Post('email-login')
  @HttpCode(HttpStatus.OK)
  async emailLogin(
    @Body(ValidationPipe) emailLoginDto: EmailLoginDto,
    @Req() req: Request,
  ) {
    const result = await this.authService.emailLogin(emailLoginDto);

    if (result.success && result.sessionId) {
      req.session.user = {
        userId: result.userInfo?.email || '',
        email: result.userInfo?.email || '',
        isAuthenticated: true,
        loginTime: new Date(),
      };
    }

    return result;
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
