import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

// Database
import { TypeOrmDbConfig } from './common/configs/typeorm.config';
import { UserEntity } from './database/entities/user.entity';

// Controllers
import { GoogleController } from './app/controllers/google.controller';
import { AppleController } from './app/controllers/apple.controller';
import { LocalController } from './app/controllers/local.controller';

// Services
import { OtpService } from './app/services/otp.service';
import { MailerService } from './app/services/mailer.service';
import { GoogleService } from './app/services/google.service';
import { AppleService } from './app/services/apple.service';
import { LocalService } from './app/services/local.service';
import { UserService } from './app/services/user.service';

// Configuration
import { cacheConfig, jwtConfig, envConfig } from './common/configs';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(envConfig),
    JwtModule.register(jwtConfig),
    CacheModule.registerAsync(cacheConfig),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmDbConfig,
    }),
    TypeOrmModule.forFeature([UserEntity]),
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
