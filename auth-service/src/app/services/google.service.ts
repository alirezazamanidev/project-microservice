import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
import { UserService } from './user.service';
import { AuthErrorCodes } from '../../common/enums/error-codes.enum';
import { createStandardError } from '../../common/utils/error.util';

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
  ) {}

  /**
   * Handle Google OAuth login process
   */
  async googleLogin(code: string) {
    const accessToken = await this.exchangeCodeForToken(code);
    const userProfile = await this.fetchUserProfile(accessToken);
    const user = await this.userService.createOrUpdate({
      email: userProfile.email,
      picture: userProfile.picture,
      fullname: userProfile.name,
    });
    this.logger.log(`User ${user.email}  logged in successfully`);
    return user;
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForToken(code: string): Promise<string> {
    const tokenPayload = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
    };

    const { data } = await lastValueFrom(
      this.httpService.post(process.env.GOOGLE_TOKEN_URL, tokenPayload).pipe(
        catchError((error) => {
          throw new RpcException(
            createStandardError(
              HttpStatus.UNAUTHORIZED,
              AuthErrorCodes.GOOGLE_AUTH_ERROR,
              'Failed to exchange authorization code for token',
              { code, originalError: error.message },
            ),
          );
        }),
      ),
    );

    return data?.access_token;
  }

  private async fetchUserProfile(accessToken: string) {
    const { data } = await lastValueFrom(
      this.httpService
        .get(process.env.GOOGLE_USERINFO_URL, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .pipe(
          catchError((error) => {
            this.logger.error('Failed to fetch user profile:', error.message);
            throw new RpcException(
              createStandardError(
                HttpStatus.UNAUTHORIZED,
                AuthErrorCodes.GOOGLE_AUTH_ERROR,
                'Failed to fetch user profile from Google',
                { originalError: error.message },
              ),
            );
          }),
        ),
    );

    return data;
  }
}
