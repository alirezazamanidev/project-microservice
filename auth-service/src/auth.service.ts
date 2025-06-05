import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { RedisService } from './common/services/redis.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

interface UserPayload {
  userId: string;
  email: string;
  name?: string;
  picture?: string;
  sessionId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

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

  async saveUserPayload(payload: UserPayload) {
    // Save payload in Redis using sessionId as key
    await this.cacheManager.set(
      `sess:${payload.sessionId}`,
      payload,
      60 * 60 * 24 * 7, // 7 days
    );

    return {
      success: true,
      message: 'User payload saved successfully',
      sessionId: payload.sessionId,
    };
  }

  //   async getUserPayloadBySession(
  //     sessionId: string,
  //   ): Promise<UserPayload | null> {
  //     try {
  //       return await this.redisService.getUserPayload(sessionId);
  //     } catch (error) {
  //       console.error('❌ Error getting user payload:', error);
  //       return null;
  //     }
  //   }

  //   async deleteUserSession(
  //     sessionId: string,
  //   ): Promise<{ success: boolean; message: string }> {
  //     try {
  //       const deleted = await this.redisService.deleteUserPayload(sessionId);

  //       return {
  //         success: deleted,
  //         message: deleted
  //           ? 'Session deleted successfully'
  //           : 'Failed to delete session',
  //       };
  //     } catch (error) {
  //       console.error('❌ Error deleting session:', error);
  //       return {
  //         success: false,
  //         message: 'Failed to delete session',
  //       };
  //     }
  //   }

  //   async getAllActiveSessions(): Promise<UserPayload[]> {
  //     try {
  //       return await this.redisService.getAllActiveSessions();
  //     } catch (error) {
  //       console.error('❌ Error getting active sessions:', error);
  //       return [];
  //     }
  //   }
}
