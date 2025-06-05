import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UserPayload } from 'src/common/interfaces/auth.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async saveUserPayload(payload: UserPayload) {
    const key = `user:${payload.email}`;
    await this.cacheManager.set(key, payload, 0); // 0 means no expiration (forever)
    this.logger.log(`User payload saved for email: ${payload.email}`);
    return payload;
  }

  async getUserPayload(email: string): Promise<UserPayload | null> {
    const key = `user:${email}`;
    const payload = (await this.cacheManager.get(key)) as UserPayload | null;
    return payload;
  }

  async deleteUserPayload(email: string) {
    const key = `user:${email}`;
    await this.cacheManager.del(key);
    this.logger.log(`User payload deleted for email: ${email}`);
  }

  async isUserVerified(email: string): Promise<boolean> {
    const userPayload = await this.getUserPayload(email);
    return userPayload?.isVerified || false;
  }

  async updateVerificationStatus(
    email: string,
    isVerified: boolean,
  ): Promise<UserPayload | null> {
    const userPayload = await this.getUserPayload(email);
    if (userPayload) {
      userPayload.isVerified = isVerified;
      await this.saveUserPayload(userPayload);
      return userPayload;
    }
    return null;
  }
}
