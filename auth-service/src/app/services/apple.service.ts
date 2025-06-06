import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
import { UserService } from './user.service';
import { AuthErrorCodes } from '../../common/enums/error-codes.enum';
import { createStandardError } from '../../common/utils/error.util';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppleService {
  private readonly logger = new Logger(AppleService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async appleLogin(code: string, state?: string) {
    try {
      // Generate client secret JWT for Apple
      const clientSecret = this.generateClientSecret();

      // Exchange authorization code for access token
      const tokenData = await this.exchangeCodeForToken(code, clientSecret);

      // Decode and verify the id_token
      const userInfo = await this.verifyAndDecodeIdToken(tokenData.id_token);

      const { email, name } = userInfo;

      // Save user payload
      await this.userService.saveUserPayload({
        email,
        name: name || email.split('@')[0],
        picture: '', // Apple doesn't provide profile pictures
      });

      return {
        id: userInfo.sub,
        email,
        name: name || email.split('@')[0],
        picture: '',
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error('Unexpected error in Apple login:', error);
      throw new RpcException(
        createStandardError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          AuthErrorCodes.APPLE_AUTH_ERROR,
          undefined,
          { originalError: error.message },
        ),
      );
    }
  }

  private generateClientSecret(): string {
    const header = {
      alg: 'ES256',
      kid: process.env.APPLE_KEY_ID,
    };

    const payload = {
      iss: process.env.APPLE_TEAM_ID,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15777000, // 6 months
      aud: 'https://appleid.apple.com',
      sub: process.env.APPLE_CLIENT_ID,
    };

    // Apple requires ES256 algorithm with private key
    const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!privateKey) {
      throw new RpcException(
        createStandardError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          AuthErrorCodes.APPLE_AUTH_ERROR,
          'Apple private key not configured',
        ),
      );
    }

    return this.jwtService.sign(payload, {
      secret: privateKey,
      header,
      algorithm: 'ES256',
    });
  }

  private async exchangeCodeForToken(code: string, clientSecret: string) {
    try {
      const { data } = await lastValueFrom(
        this.httpService
          .post(
            'https://appleid.apple.com/auth/token',
            {
              client_id: process.env.APPLE_CLIENT_ID,
              client_secret: clientSecret,
              code,
              grant_type: 'authorization_code',
              redirect_uri: process.env.APPLE_CALLBACK_URL,
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          )
          .pipe(
            catchError((error) => {
              throw new RpcException(
                createStandardError(
                  HttpStatus.UNAUTHORIZED,
                  AuthErrorCodes.APPLE_AUTH_ERROR,
                  'Failed to exchange code for token',
                  { code, originalError: error.message },
                ),
              );
            }),
          ),
      );

      return data;
    } catch (error) {
      throw error;
    }
  }

  private async verifyAndDecodeIdToken(idToken: string) {
    try {
      // For production, you should verify the JWT signature using Apple's public keys
      // For now, we'll decode without verification (not recommended for production)
      const decoded = jwt.decode(idToken) as any;

      if (!decoded || !decoded.email) {
        throw new RpcException(
          createStandardError(
            HttpStatus.UNAUTHORIZED,
            AuthErrorCodes.APPLE_TOKEN_INVALID,
            'Invalid Apple ID token',
          ),
        );
      }

      return {
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name
          ? `${decoded.name.firstName || ''} ${decoded.name.lastName || ''}`.trim()
          : null,
        email_verified:
          decoded.email_verified === 'true' || decoded.email_verified === true,
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(
        createStandardError(
          HttpStatus.UNAUTHORIZED,
          AuthErrorCodes.APPLE_TOKEN_INVALID,
          'Failed to decode Apple ID token',
          { originalError: error.message },
        ),
      );
    }
  }
}
