declare namespace NodeJS {
  interface ProcessEnv {
    // Node
    NODE_ENV: string;
    // RabbitMq
    RABBITMQ_HOST: string;
    RABBITMQ_PORT: number;
    // redis
    REDIS_PORT: number;
    REDIS_HOST: string;
  }
}
