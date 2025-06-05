import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { OtpService } from './services/otp.service';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { GoogleController } from './controllers/google.controller';
import { MailerService } from './services/mailer.service';
import { GoogleService } from './services/google.service';
import { LocalService } from './services/local.service';
import { LocalController } from './controllers/local.controller';
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
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
    }),
  ],
  controllers: [LocalController, GoogleController],
  providers: [MailerService, OtpService, GoogleService, LocalService],
})
export class AuthModule {}
