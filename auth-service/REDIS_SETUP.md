# Redis Setup for Auth Service

## نصب Redis Package

```bash
npm install redis @types/redis
```

## تغییر Redis Service برای استفاده از Redis واقعی

در فایل `src/common/services/redis.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    try {
      this.client = createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
        password: process.env.REDIS_PASSWORD,
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
      });

      await this.client.connect();
      console.log('✅ Connected to Redis successfully');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  async setUserPayload(
    sessionId: string,
    payload: UserPayload,
    ttl: number = 3600,
  ): Promise<boolean> {
    try {
      await this.client.setEx(sessionId, ttl, JSON.stringify(payload));
      console.log(`✅ User payload saved in Redis for session: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('❌ Error saving to Redis:', error);
      return false;
    }
  }

  async getUserPayload(sessionId: string): Promise<UserPayload | null> {
    try {
      const data = await this.client.get(sessionId);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting from Redis:', error);
      return null;
    }
  }

  async deleteUserPayload(sessionId: string): Promise<boolean> {
    try {
      await this.client.del(sessionId);
      console.log(
        `✅ User payload deleted from Redis for session: ${sessionId}`,
      );
      return true;
    } catch (error) {
      console.error('❌ Error deleting from Redis:', error);
      return false;
    }
  }
}
```

## متغیرهای محیطی

در فایل `.env`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_if_needed
```

## راه‌اندازی Redis با Docker

```bash
docker run -d \
  --name redis-auth \
  -p 6379:6379 \
  redis:alpine
```

یا با Docker Compose:

```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - '6379:6379'
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```
