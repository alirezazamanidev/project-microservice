import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {}

  async googleLogin(code: string) {
    // Exchange authorization code for access token

    const { data } = await lastValueFrom(
      this.httpService
        .post('https://oauth2.googleapis.com/token', {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code,
          redirect_uri: process.env.GOOGLE_CALLBACK_URL,
          grant_type: 'authorization_code',
        })
        .pipe(
          catchError((error) => {
            throw error;
            // throw new RpcException({
            //     statusCode: error.response?.status || 500,
            //     message: error.response?.data?.error_description || 'GOOGLE_AUTH_ERROR',
            //     code: error.response?.data?.error || 'GOOGLE_AUTH_ERROR'
            //   });
          }),
        ),
    );

    const { access_token, id_token } = data;

    const { data: profile } = await lastValueFrom(
      this.httpService.get(`https://www.googleapis.com/oauth2/v1/userinfo`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }),
    );

    return profile;
  }
}
