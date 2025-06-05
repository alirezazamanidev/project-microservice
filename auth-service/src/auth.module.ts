import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './common/services/redis.service';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:'.env'
    }),
    CacheModule.registerAsync({
    useFactory:async()=>{
      return {
        stores:[
          createKeyv(`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)
        ]
      }
    }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, RedisService],
})
export class AuthModule {}
