import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import {
  UserDto,
  UserPayload,
  UserInfo,
} from 'src/common/interfaces/auth.interface';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/database/entities/user.entity';
import { randomUUID } from 'crypto';
import { RpcException } from '@nestjs/microservices';
import { AuthErrorCodes } from 'src/common/enums/error-codes.enum';
import { createStandardError } from 'src/common/utils/error.util';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createOrUpdate(userDto: UserDto) {
    
    // find user
    let user = await this.userRepository.findOne({
      where: {
        email: userDto.email,
      },
    });
    if (!user) {
      user = this.userRepository.create({...userDto,verifyEmail:true});
    } else {
      user.sessionId = user.sessionId
      if(!user.verifyEmail) user.verifyEmail=true
    }
    await this.userRepository.save(user);
    return user;
  }

  async saveUserPayload(payload: UserPayload) {
    const key = `user:${payload.email}`;
    const sessionKey = `session:${payload.sessionId}`;

    // Save user payload
    await this.cacheManager.set(key, payload, 0); // 0 means no expiration (forever)

    // Link session to user email for quick lookup
    if (payload.sessionId) {
      await this.cacheManager.set(
        sessionKey,
        { email: payload.email },
        7 * 24 * 60 * 60 * 1000,
      ); // 7 days
    }

    this.logger.log(`User payload saved for email: ${payload.email}`);
    return payload;
  }

  async getUserPayload(email: string): Promise<UserPayload | null> {
    const key = `user:${email}`;
    const payload = await this.cacheManager.get<UserPayload | null>(key);
    return payload;
  }

  async getUserInfo(data: {
    sessionId?: string;
    email?: string;
  }): Promise<UserInfo> {
    try {
      let userEmail = data.email;

      // If we have sessionId but no email, look up email by session
      if (data.sessionId && !userEmail) {
        const sessionKey = `session:${data.sessionId}`;
        const sessionData = await this.cacheManager.get<{ email: string }>(
          sessionKey,
        );

        if (!sessionData) {
          throw new RpcException(
            createStandardError(
              HttpStatus.UNAUTHORIZED,
              AuthErrorCodes.UNAUTHORIZED,
              'Session not found or expired',
              { sessionId: data.sessionId },
            ),
          );
        }

        userEmail = sessionData.email;
      }

      if (!userEmail) {
        throw new RpcException(
          createStandardError(
            HttpStatus.BAD_REQUEST,
            AuthErrorCodes.MISSING_REQUIRED_FIELD,
            'Email or sessionId is required',
            data,
          ),
        );
      }

      // Get user payload
      const userPayload = await this.getUserPayload(userEmail);

      if (!userPayload) {
        throw new RpcException(
          createStandardError(
            HttpStatus.NOT_FOUND,
            AuthErrorCodes.ACCOUNT_NOT_FOUND,
            'User not found',
            { email: userEmail },
          ),
        );
      }

      // Return user info without sensitive data
      return {
        userId: userPayload.email, // Using email as userId for now
        email: userPayload.email,
        fullName: userPayload.fullName || userPayload.name,
        picture: userPayload.picture || '',
        isVerified: userPayload.verifyEmail || userPayload.isVerified || false,
        sessionId: data.sessionId,
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error('Error getting user info:', error);
      throw new RpcException(
        createStandardError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          AuthErrorCodes.INTERNAL_SERVER_ERROR,
          'Failed to get user information',
          { originalError: error.message },
        ),
      );
    }
  }

  async updateUserSession(email: string, sessionId: string) {
    try {
      // Update session mapping
      const sessionKey = `session:${sessionId}`;
      await this.cacheManager.set(
        sessionKey,
        { email },
        7 * 24 * 60 * 60 * 1000,
      ); // 7 days

      // Update user payload with session info
      const userPayload = await this.getUserPayload(email);
      if (userPayload) {
        const updatedPayload = { ...userPayload, sessionId };
        await this.saveUserPayload(updatedPayload);
      }

      this.logger.log(
        `Session updated for email: ${email}, sessionId: ${sessionId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Error updating session for ${email}:`, error);
      throw error;
    }
  }

  async removeUserSession(sessionId: string) {
    try {
      const sessionKey = `session:${sessionId}`;
      await this.cacheManager.del(sessionKey);
      this.logger.log(`Session removed: ${sessionId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error removing session ${sessionId}:`, error);
      throw error;
    }
  }
}
