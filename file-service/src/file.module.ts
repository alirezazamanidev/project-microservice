import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { ConfigModule } from '@nestjs/config';
import { Client } from 'minio';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [FileController],
  providers: [
    FileService,
    {
      provide: 'MINIO_CLIENT',
      useFactory: async () => {
        return new Client({
          endPoint: process.env.MINIO_ENDPOINT,
          port: process.env.MINIO_PORT || 9000,
          useSSL: process.env.MINIO_USE_SSL === 'true',
          accessKey: process.env.MINIO_ACCESS_KEY,
          secretKey: process.env.MINIO_SECRET_KEY,
        });
      },
    },
  ],
})
export class FileModule {}
