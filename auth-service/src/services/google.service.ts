import { HttpService } from "@nestjs/axios";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { Cache } from "cache-manager";
import { catchError, lastValueFrom } from "rxjs";
import { UserService } from "./user.service";

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);
  constructor(private readonly httpService: HttpService,
    private readonly userService: UserService
  ) {}

  
  async googleLogin(code: string) {
    try {
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
              this.logger.error('Google OAuth token exchange failed:', error);
              throw new RpcException({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: 'Google authentication failed',
                code: 'GOOGLE_AUTH_ERROR',
              });
            }),
          ),
      );

      const { access_token } = data;

      const { data: profile } = await lastValueFrom(
        this.httpService
          .get(`https://www.googleapis.com/oauth2/v1/userinfo`, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })
          .pipe(
            catchError((error) => {
              this.logger.error('Failed to fetch Google user profile:', error);
              throw new RpcException({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: 'Failed to fetch user profile',
                code: 'PROFILE_FETCH_ERROR',
              });
            }),
          ),
      );

      const { email, name, picture } = profile;
      await this.userService.saveUserPayload({ email, name, picture });
      return profile;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error('Unexpected error in Google login:', error);
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error during authentication',
        code: 'INTERNAL_ERROR',
      });
    }
  }
}