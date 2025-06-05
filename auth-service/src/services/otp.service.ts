import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OtpRecord } from '../common/interfaces/auth.interface';
import { randomInt } from 'crypto';
import { RpcException } from '@nestjs/microservices';
import { AuthErrorCodes } from '../common/enums/error-codes.enum';
import { createStandardError } from '../common/utils/error.util';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  async saveOtp(
    email: string,
    otp: string,
    type: 'login' | 'register' = 'login',
  ): Promise<void> {
    try {
      const otpRecord: OtpRecord = {
        email,
        otp,
        expiresAt: new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000),
        attempts: 0,
        type,
      };
      const key = `otp:${email}`;
      const ttl = this.OTP_EXPIRY_MINUTES * 60 * 1000; // TTL in milliseconds

      await this.cacheManager.set(key, otpRecord, ttl);

      // Verify the data was saved
      const savedRecord = await this.cacheManager.get(key);
      this.logger.log(`OTP saved successfully for email: ${email}`);
    } catch (error) {
      this.logger.error(`Error saving OTP for email ${email}:`, error);
      throw new RpcException(
        createStandardError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          AuthErrorCodes.OTP_SAVE_ERROR,
          undefined,
          { email, originalError: error.message },
        ),
      );
    }
  }

  async verifyOtp(
    email: string,
    providedOtp: string,
  ): Promise<{ valid: boolean; message: string; type?: 'login' | 'register' }> {
    const key = `otp:${email}`;
    const otpRecord: OtpRecord | null = await this.cacheManager.get(key);

    if (!otpRecord) {
      throw new RpcException(
        createStandardError(
          HttpStatus.UNAUTHORIZED,
          AuthErrorCodes.OTP_EXPIRED,
          undefined,
          { email },
        ),
      );
    }

    if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
      await this.cacheManager.del(key);
      throw new RpcException(
        createStandardError(
          HttpStatus.UNAUTHORIZED,
          AuthErrorCodes.MAX_OTP_ATTEMPTS_EXCEEDED,
          undefined,
          { email, attempts: otpRecord.attempts },
        ),
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      await this.cacheManager.del(key);
      throw new RpcException(
        createStandardError(
          HttpStatus.UNAUTHORIZED,
          AuthErrorCodes.OTP_EXPIRED,
          undefined,
          { email },
        ),
      );
    }

    otpRecord.attempts += 1;
    const ttl = this.OTP_EXPIRY_MINUTES * 60 * 1000;
    await this.cacheManager.set(key, otpRecord, ttl);

    if (otpRecord.otp !== providedOtp) {
      throw new RpcException(
        createStandardError(
          HttpStatus.UNAUTHORIZED,
          AuthErrorCodes.OTP_INVALID,
          undefined,
          { email, attempts: otpRecord.attempts },
        ),
      );
    }

    // OTP is valid, remove it from cache
    await this.cacheManager.del(key);
    this.logger.log(`OTP verified successfully for email: ${email}`);

    return { valid: true, message: 'OTP code is valid', type: otpRecord.type };
  }

  async hasValidOtp(email: string): Promise<boolean> {
    const key = `otp:${email}`;
    const otpRecord: OtpRecord | null = await this.cacheManager.get(key);

    if (!otpRecord) return false;

    if (
      new Date() <= otpRecord.expiresAt &&
      otpRecord.attempts < this.MAX_ATTEMPTS
    )
      return true;

    return false;
  }

  async deleteOtp(email: string): Promise<void> {
    const key = `otp:${email}`;
    await this.cacheManager.del(key);
    this.logger.log(`OTP deleted for email: ${email}`);
  }
}
