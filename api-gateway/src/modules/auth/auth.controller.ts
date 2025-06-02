import {
  Controller,
  Get,
  HttpStatus,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IsAuthenticated } from './decorators/auth.decorator';
import { UserDto } from './dto/user.dto';
import { ErrorResponseDto } from 'src/common/dtos/base-error-response.dto';
import { ApiCustomResponse } from 'src/common/decorators/swagger-response';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: 'google login' })
  @Get('google/login')
  @ApiCustomResponse({description:'Redirecting to Google for authentication',status:200})
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return { message: 'Redirecting to Google for authentication' };
  }
  @ApiBadRequestResponse({description:'bad request',type:ErrorResponseDto})
  @ApiCustomResponse({description:"logged in successFully",status:HttpStatus.OK})
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

  @ApiCustomResponse({status:HttpStatus.OK,model:UserDto,description:"Get Payload User"})
  @ApiUnauthorizedResponse({description:"Unauthorized user",type:ErrorResponseDto})
  @IsAuthenticated()
  @ApiOperation({ summary: 'user payload' })
  @Get('payload')
  payload(@Req() req: Request){
    return{
     
      message:"user payload",
      data:req.user as UserDto,
    }
  }
}
