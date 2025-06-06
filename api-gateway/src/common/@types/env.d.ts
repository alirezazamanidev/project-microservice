declare namespace NodeJS {
  interface ProcessEnv {
    // Node
    NODE_ENV: string;
    // RabbitMq
    RABBITMQ_HOST: string;
    RABBITMQ_PORT: number;
    // Google
    GOOGLE_CALLBACK_URL: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    // Apple
    APPLE_CALLBACK_URL: string;
    APPLE_CLIENT_ID: string;
    // APPLE_CLIENT_SECRET: string;
    // session
    SESSION_SECRET_KEY: string;
    // Redis
    REDIS_HOST: string;
    REDIS_PORT: number;
  }
}
