import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { OtpService } from './services/otp.service';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { GoogleController } from './controllers/google.controller';
import { AppleController } from './controllers/apple.controller';
import { MailerService } from './services/mailer.service';
import { GoogleService } from './services/google.service';
import { AppleService } from './services/apple.service';
import { LocalService } from './services/local.service';
import { LocalController } from './controllers/local.controller';
import { UserService } from './services/user.service';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
     global:true
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
  controllers: [LocalController, GoogleController, AppleController],
  providers: [
    MailerService,
    OtpService,
    GoogleService,
    AppleService,
    LocalService,
    UserService,
  ],
})
export class AuthModule {}
