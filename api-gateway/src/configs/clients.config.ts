import { Transport, ClientsModuleOptions } from '@nestjs/microservices';
import { config } from 'dotenv';
config()
export const clientsConfig: ClientsModuleOptions = [
  {
    name: 'AUTH_SERVICE',
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
      ],
      queue: 'auth',
      queueOptions: {
        durable: false,
      
      },
    
    },
  },
  {
    name: 'FILE_SERVICE',
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
      ],
      queue: 'file',
      queueOptions: {
        durable: false
      
      },
      
    },
  },
];

export const MICROSERVICE_TOKENS = {
  AUTH_SERVICE: 'AUTH_SERVICE',
  FILE_SERVICE: 'FILE_SERVICE',
} as const;

export type MicroserviceToken =
  (typeof MICROSERVICE_TOKENS)[keyof typeof MICROSERVICE_TOKENS];
