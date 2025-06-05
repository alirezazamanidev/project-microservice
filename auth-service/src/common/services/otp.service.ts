import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OtpRecord } from '../interfaces/auth.interface';
import { randomInt } from 'crypto';
import { RpcException } from '@nestjs/microservices';
@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  async saveOtp(email: string, otp: string,type: 'login' | 'register' = 'login'): Promise<void> {
    try {
      const otpRecord: OtpRecord = {
        email,
        otp,
        expiresAt: new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000),
        attempts: 0,
        type
      };
      const key = `otp:${email}`;
      const ttl = this.OTP_EXPIRY_MINUTES * 60 * 1000; // TTL in milliseconds
      
      await this.cacheManager.set(key, otpRecord, ttl);
      
      // Verify the data was saved
       await this.cacheManager.get(key);
      this.logger.log(`OTP saved successfully for email: ${email}`);
    } catch (error) {
     
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to save OTP',
        code: 'OTP_SAVE_ERROR',
      });
    }
  }

  async hasValidOtp(email: string): Promise<boolean> {
    const key = `otp:${email}`;
    const otpRecord: OtpRecord | null = await this.cacheManager.get(key);

    console.log('Checking valid OTP for email:', email, 'Record:', otpRecord);

    if (!otpRecord) return false;

    if (new Date() <= otpRecord.expiresAt && otpRecord.attempts < this.MAX_ATTEMPTS) return true;

    return false;
  }

  async deleteOtp(email: string): Promise<void> {
    const key = `otp:${email}`;
    await this.cacheManager.del(key);
    this.logger.log(`OTP deleted for email: ${email}`);
  }
}
