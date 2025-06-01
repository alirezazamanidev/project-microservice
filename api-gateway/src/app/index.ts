import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import { HttpAdapterHost } from '@nestjs/core';
// import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import SwaggerConfig from 'src/configs/swagger.config';
import Redis from 'ioredis';
import { RedisStore } from 'connect-redis';
import { AllExceptionsFilter } from 'src/common/filters/all-exception.filter';
import { RpcErrorInterceptor } from 'src/common/inteceptors/rpc-error.interceptor';

export const appInitialization = (app: NestExpressApplication) => {
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  // filters config
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalInterceptors(new RpcErrorInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const redisClient = new Redis({
    host: 'localhost',
    port: 6379,
    // password: 'your_redis_password', // if needed
  });

  // middlewares
  app.use(helmet());
  app.use(compression());
  // set session
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 60 * 60 * 1000 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // domain:''
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // set prefix for API
  app.setGlobalPrefix('api');
  // swagger config
  SwaggerConfig(app);
};
