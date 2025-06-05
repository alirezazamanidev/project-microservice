import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { HttpAdapterHost } from '@nestjs/core';
// import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import SwaggerConfig from 'src/configs/swagger.config';
// import Redis from 'ioredis';
// import { RedisStore } from 'connect-redis';
import { AllExceptionsFilter } from 'src/common/filters/all-exception.filter';
import { RpcErrorInterceptor } from 'src/common/inteceptors/rpc-error.interceptor';
import { sessionConfig } from 'src/configs/session.config';

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

  // middlewares
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser(process.env.COOKIE_SECRET));

  // Session configuration using cookie store (no Redis)
  app.use(session(sessionConfig as session.SessionOptions));

  // set prefix for API
  app.setGlobalPrefix('api');
  // swagger config
  SwaggerConfig(app);
};
