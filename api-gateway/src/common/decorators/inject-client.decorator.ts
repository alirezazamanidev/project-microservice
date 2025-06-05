import { Inject } from '@nestjs/common';
import {
  MICROSERVICE_TOKENS,
  MicroserviceToken,
} from '../../configs/clients.config';

export const InjectClient = (token: MicroserviceToken) => Inject(token);

// Individual decorators for each service for better developer experience
export const InjectAuthClient = () =>
  InjectClient(MICROSERVICE_TOKENS.AUTH_SERVICE);
export const InjectFileClient = () =>
  InjectClient(MICROSERVICE_TOKENS.FILE_SERVICE);
