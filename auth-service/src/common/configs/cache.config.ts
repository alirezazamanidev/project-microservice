import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

export const cacheConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  useFactory: async () => {
    return {
      stores: [
        createKeyv(
          `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        ),
      ],
    };
  },
};
