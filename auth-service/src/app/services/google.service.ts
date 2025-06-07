import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
import { UserService } from './user.service';
import { AuthErrorCodes } from '../../common/enums/error-codes.enum';
import { createStandardError } from '../../common/utils/error.util';

// Types
interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface GoogleUserProfile {
  email: string;
  name: string;
  picture: string;
  id: string;
  verified_email: boolean;
}

export interface GoogleUserInfo {
  email: string;
  fullname: string;
  picture: string;
}

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);

  // Constants
  private readonly GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private readonly GOOGLE_USERINFO_URL =
    'https://www.googleapis.com/oauth2/v1/userinfo';

  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
  ) {
    this.validateConfiguration();
  }

  /**
   * Handle Google OAuth login process
   */
  async googleLogin(code: string,sessionId:string): Promise<GoogleUserInfo> {
    try {
      this.logger.log('Starting Google OAuth login process');

      const accessToken = await this.exchangeCodeForToken(code);
      const userProfile = await this.fetchUserProfile(accessToken);
    
     const user=await this.userService.createOrUpdate({fullname:userProfile.name,email:userProfile.email},sessionId)
      return this.transformUserProfile(userProfile);
    } catch (error) {
      throw new RpcException(
        createStandardError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          AuthErrorCodes.INTERNAL_SERVER_ERROR,

          // { originalError: error.message },
        ),
      );
    }
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
      this.httpService
        .post<GoogleTokenResponse>(this.GOOGLE_TOKEN_URL, tokenPayload)
        .pipe(
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

    return data.access_token;
  }

  /**
   * Fetch user profile from Google
   */
  private async fetchUserProfile(
    accessToken: string,
  ): Promise<GoogleUserProfile> {
    const { data } = await lastValueFrom(
      this.httpService
        .get<GoogleUserProfile>(this.GOOGLE_USERINFO_URL, {
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

  /**
   * Transform Google user profile to our user info format
   */
  private transformUserProfile(profile: GoogleUserProfile): GoogleUserInfo {
    return {
      email: profile.email,
      fullname: profile.name,
      picture: profile.picture,
    };
  }

  /**
   * Validate required environment configuration
   */
  private validateConfiguration(): void {
    const requiredEnvVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_CALLBACK_URL',
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName],
    );

    if (missingVars.length > 0) {
      const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
}
