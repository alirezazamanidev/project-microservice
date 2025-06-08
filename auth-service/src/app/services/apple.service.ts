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
import { UserDto } from '../../common/interfaces/auth.interface';

interface ApplePublicKey {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

interface AppleKeysResponse {
  keys: ApplePublicKey[];
}

interface AppleIdTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  email?: string;
  email_verified?: string | boolean;
  name?: {
    firstName?: string;
    lastName?: string;
  };
  real_user_status?: number;
}

@Injectable()
export class AppleService {
  private readonly logger = new Logger(AppleService.name);
  private applePublicKeys: Map<string, string> = new Map();
  private lastKeysFetch: number = 0;
  private readonly KEYS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async appleCallback(code: string, state?: string) {
    try {
      this.logger.log('Starting Apple authentication callback');
      // Generate client secret JWT for Apple
      const clientSecret = this.generateClientSecret();

      // Exchange authorization code for access token
      const tokenData = await this.exchangeCodeForToken(code, clientSecret);

      if (!tokenData.id_token) {
        throw new RpcException(
          createStandardError(
            HttpStatus.BAD_REQUEST,
            AuthErrorCodes.APPLE_AUTH_ERROR,
            'No ID token received from Apple',
          ),
        );
      }

      // Decode and verify the id_token
      const userInfo = await this.verifyAndDecodeIdToken(tokenData.id_token);

      const { email, name, sub } = userInfo;

      if (!email) {
        throw new RpcException(
          createStandardError(
            HttpStatus.BAD_REQUEST,
            AuthErrorCodes.APPLE_AUTH_ERROR,
            'Email not provided by Apple',
          ),
        );
      }

      // Create user payload
      const userDto: UserDto = {
        email,
        fullname: name || email.split('@')[0],
        picture: '', // Apple doesn't provide profile pictures
      };

      // Save user to database
      const user = await this.userService.createOrUpdate(userDto);

      this.logger.log(`Apple authentication successful for user: ${email}`);

      return {
        id: sub,
        email: user.email,
        name: user.fullname,
        picture: '',
        userId: user.id,
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
          'Apple authentication failed',
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

      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: process.env.APPLE_TEAM_ID,
        iat: now,
        exp: now + 15777000, // 6 months (Apple's maximum)
        aud: 'https://appleid.apple.com',
        sub: process.env.APPLE_CLIENT_ID,
      };

      // Apple requires ES256 algorithm with private key
      const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      return this.jwtService.sign(payload, {
        secret: privateKey,
        header,
        algorithm: 'ES256',
      });
   
  }

  private async exchangeCodeForToken(code: string, clientSecret: string) {
  
      this.logger.log('Exchanging authorization code for tokens');

      const params = new URLSearchParams({
        client_id: process.env.APPLE_CLIENT_ID!,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.APPLE_CALLBACK_URL!,
      });

      const { data } = await lastValueFrom(
        this.httpService
          .post('https://appleid.apple.com/auth/token', params.toString(), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
            },
            timeout: 10000, // 10 seconds timeout
          })
          .pipe(
            catchError((error) => {
              this.logger.error('Apple token exchange failed:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
              });

              throw new RpcException(
                createStandardError(
                  HttpStatus.UNAUTHORIZED,
                  AuthErrorCodes.APPLE_AUTH_ERROR,
                  'Failed to exchange authorization code',
                  {
                    appleError: error.response?.data,
                    statusCode: error.response?.status,
                  },
                ),
              );
            }),
          ),
      );

      this.logger.log('Successfully exchanged code for tokens');
      return data;
    
  }

  private async verifyAndDecodeIdToken(idToken: string): Promise<{
    sub: string;
    email: string;
    name: string;
    email_verified: boolean;
  }> {
    try {
      this.logger.log('Verifying Apple ID token');

      // Decode token header to get kid (key ID)
      const decodedHeader = jwt.decode(idToken, { complete: true })
        ?.header as any;

      if (!decodedHeader || !decodedHeader.kid) {
        throw new Error('Invalid token header or missing kid');
      }

      // Get Apple's public key for verification
      const publicKey = await this.getApplePublicKey(decodedHeader.kid);

      // Verify and decode the JWT
      const payload = jwt.verify(idToken, publicKey, {
        algorithms: ['RS256'],
        audience: process.env.APPLE_CLIENT_ID,
        issuer: 'https://appleid.apple.com',
      }) as AppleIdTokenPayload;

      // Additional validations
      this.validateTokenPayload(payload);

      // Extract user information
      const userInfo = {
        sub: payload.sub,
        email: payload.email || '',
        name: this.extractUserName(payload),
        email_verified: this.parseEmailVerified(payload.email_verified),
      };

      this.logger.log('Apple ID token verified successfully');
      return userInfo;
    } catch (error) {
      this.logger.error('Apple ID token verification failed:', error);

      if (error instanceof jwt.JsonWebTokenError) {
        throw new RpcException(
          createStandardError(
            HttpStatus.UNAUTHORIZED,
            AuthErrorCodes.APPLE_TOKEN_INVALID,
            'Invalid Apple ID token',
            { jwtError: error.message },
          ),
        );
      }

      throw new RpcException(
        createStandardError(
          HttpStatus.UNAUTHORIZED,
          AuthErrorCodes.APPLE_TOKEN_INVALID,
          'Failed to verify Apple ID token',
          { originalError: error.message },
        ),
      );
    }
  }

  private async getApplePublicKey(kid: string): Promise<string> {
    try {
      // Check if we have cached keys and they're still valid
      const now = Date.now();
      if (
        this.applePublicKeys.has(kid) &&
        now - this.lastKeysFetch < this.KEYS_CACHE_DURATION
      ) {
        return this.applePublicKeys.get(kid)!;
      }

      // Fetch fresh keys from Apple
      this.logger.log('Fetching Apple public keys');
      const { data } = await lastValueFrom(
        this.httpService
          .get<AppleKeysResponse>('https://appleid.apple.com/auth/keys', {
            timeout: 10000,
          })
          .pipe(
            catchError((error) => {
              throw new Error(
                `Failed to fetch Apple public keys: ${error.message}`,
              );
            }),
          ),
      );

      // Cache the keys
      this.applePublicKeys.clear();
      for (const key of data.keys) {
        if (key.kty === 'RSA' && key.use === 'sig') {
          const publicKey = this.convertJWKToPublicKey(key);
          this.applePublicKeys.set(key.kid, publicKey);
        }
      }
      this.lastKeysFetch = now;

      const publicKey = this.applePublicKeys.get(kid);
      if (!publicKey) {
        throw new Error(`Public key not found for kid: ${kid}`);
      }

      return publicKey;
    } catch (error) {
      this.logger.error('Failed to get Apple public key:', error);
      throw new Error(`Failed to get Apple public key: ${error.message}`);
    }
  }

  private convertJWKToPublicKey(jwk: ApplePublicKey): string {
    try {
      // Convert JWK to PEM format
      const key = crypto.createPublicKey({
        key: {
          kty: jwk.kty,
          kid: jwk.kid,
          use: jwk.use,
          alg: jwk.alg,
          n: jwk.n,
          e: jwk.e,
        } as crypto.JsonWebKey,
        format: 'jwk',
      });

      return key.export({
        type: 'spki',
        format: 'pem',
      }) as string;
    } catch (error) {
      throw new Error(`Failed to convert JWK to public key: ${error.message}`);
    }
  }

  private validateTokenPayload(payload: AppleIdTokenPayload): void {
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp <= now) {
      throw new Error('Token has expired');
    }

    if (payload.iat > now + 60) {
      // allow 60 seconds clock skew
      throw new Error('Token issued in the future');
    }

    if (payload.aud !== process.env.APPLE_CLIENT_ID) {
      throw new Error('Invalid audience');
    }

    if (payload.iss !== 'https://appleid.apple.com') {
      throw new Error('Invalid issuer');
    }
  }

  private extractUserName(payload: AppleIdTokenPayload): string {
    if (payload.name) {
      const { firstName = '', lastName = '' } = payload.name;
      return `${firstName} ${lastName}`.trim() || '';
    }
    return '';
  }

  private parseEmailVerified(
    emailVerified: string | boolean | undefined,
  ): boolean {
    if (typeof emailVerified === 'boolean') {
      return emailVerified;
    }
    if (typeof emailVerified === 'string') {
      return emailVerified.toLowerCase() === 'true';
    }
    return false;
  }
}
