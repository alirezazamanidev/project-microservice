import { Controller, Get, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

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



  @ApiOperation({summary:'google redirect route'})
  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
   googleAuthRedirect(@Req() req:Request){
    if(!req?.user) throw new UnauthorizedException('login failed!');
    
    req.logIn(req.user!,(err)=>{
      if(err) throw new UnauthorizedException('login failed');
    });
     return {message:'logged In successFully'}
  }
}
