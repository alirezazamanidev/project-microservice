import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  HttpStatus,
} from '@nestjs/common';
import { BucketItem, Client } from 'minio';
import { BufferedFile } from './common/interfaces/file.interface';
import { RpcException } from '@nestjs/microservices';
import { createStandardError } from './common/utils/error.util';
import {
  FileErrorCodes,
  FileErrorMessages,
} from './common/enums/error-codes.enum';

@Injectable()
export class FileService implements OnModuleInit {
  private readonly logger = new Logger(FileService.name);

  constructor(@Inject('MINIO_CLIENT') private readonly minioClient: Client) {}
  async onModuleInit() {
    try {
      const bucketName = process.env.MINIO_BUCKET_NAME;
      if (!bucketName) {
        throw new RpcException(
          createStandardError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            FileErrorCodes.CONFIGURATION_ERROR,
            'MinIO bucket name is not configured.',
          ),
        );
      }
      const exists = await this.minioClient.bucketExists(bucketName);

      if (!exists) {
        await this.minioClient.makeBucket(
          bucketName,
          process.env.MINIO_REGION || 'us-east-1',
        );
        this.logger.log(`MinIO bucket "${bucketName}" created successfully.`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize MinIO bucket:', error);
      throw new RpcException(
        createStandardError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          FileErrorCodes.MINIO_CONNECTION_ERROR,
          'Failed to create or connect to MinIO bucket.',
          { originalError: error.message },
        ),
      );
    }
  }

  async uploadFile(file: BufferedFile, user: { email: string }) {
    try {
      const safeEmail = user.email
        .replace(/@/g, '_at_')
        .replace(/\./g, '_dot_');
      const objectName = `${safeEmail}/${Date.now()}-${file.originalname}`;
      const bucketName = process.env.MINIO_BUCKET_NAME;

      await this.minioClient.putObject(
        bucketName,
        objectName,
        Buffer.from(file.buffer),
        file.size,
        { 'Content-Type': file.mimetype },
      );

      this.logger.log(
        `File ${objectName} uploaded successfully by user ${user.email}.`,
      );

      return {
        filePath: objectName,
        size: file.size,
        mimetype: file.mimetype,
        originalname: file.originalname,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file for user ${user.email}:`, error);
      throw new RpcException(
        createStandardError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          FileErrorCodes.FILE_UPLOAD_FAILED,
          undefined,
          { originalError: error.message },
        ),
      );
    }
  }
  async getUserFiles(user: { email: string }) {
    try {
      const safeEmail = user.email
        .replace(/@/g, '_at_')
        .replace(/\./g, '_dot_');
      const files: any[] = [];
      const prefix = `${safeEmail}/`;
      const bucketName = process.env.MINIO_BUCKET_NAME;
      const stream = await this.minioClient.listObjectsV2(
        bucketName,
        prefix,
        true,
      );

      for await (const obj of stream as AsyncIterable<BucketItem>) {
        if (obj.name && !obj.name?.endsWith('/')) {
          try {
            const expiry = parseInt(process.env.MINIO_FILE_EXPIRES, 10);

            const presignedUrl = await this.minioClient.presignedGetObject(
              bucketName,
              obj.name,
              expiry,
            );

            files.push({
              filename: obj.name.substring(prefix.length),
              expiresAt: new Date(Date.now() + expiry * 1000).toISOString(),
              expires_in_seconds: expiry,
              url: presignedUrl,
              size: obj.size,
              lastModified: obj.lastModified,
            });
          } catch (error) {
            this.logger.error(
              `Failed to generate presigned URL for ${obj.name}:`,
              error,
            );
            // We can choose to continue listing other files or throw
            // For now, let's add a placeholder for the failed file
            files.push({
              filename: obj.name.substring(prefix.length),
              error: FileErrorMessages.PRESIGNED_URL_GENERATION_FAILED,
            });
          }
        }
      }
      return files;
    } catch (error) {
      this.logger.error(`Failed to list files for user ${user.email}:`, error);
      throw new RpcException(
        createStandardError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          FileErrorCodes.FILE_LISTING_FAILED,
          undefined,
          { originalError: error.message },
        ),
      );
    }
  }
}
