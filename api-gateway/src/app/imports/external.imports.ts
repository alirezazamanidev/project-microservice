import { ConfigModule } from '@nestjs/config';
import { ClientsGlobalModule } from '../../modules/clients/clients.module';

export const appExternalImports = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }),
  ClientsGlobalModule,
];
