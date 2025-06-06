import Redis from 'ioredis';
import connectRedis, { RedisStore } from 'connect-redis'
import session from 'express-session';



export const sessionConfig = {
  store:  new RedisStore({
    client: new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),

    }),
    ttl: 60 * 60 * 24 * 7 // 7 days
  }),
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax' as const,
    domain: process.env.NODE_ENV === 'production' ? 'yourdomain.com' : undefined,
    path: '/',
  },
};
