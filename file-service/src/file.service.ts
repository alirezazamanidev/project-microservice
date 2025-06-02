import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BucketItem, Client } from 'minio';
import { BufferedFile } from './common/interfaces/file.interface';

@Injectable()
export class FileService implements OnModuleInit {
  private readonly logger = new Logger(FileService.name);

  constructor(@Inject('MINIO_CLIENT') private readonly minioClient: Client) {}
  async onModuleInit() {
    
      const exists = await this.minioClient.bucketExists(
        process.env.MINIO_BUCKET_NAME,
      );

      if (!exists) {
        await this.minioClient.makeBucket(
          process.env.MINIO_BUCKET_NAME,
          process.env.MINIO_REGION || 'us-east-1',
        );
        this.logger.log(
          `MinIO bucket "${process.env.MINIO_BUCKET_NAME}" created successfully.`,
        );
      }
   
  }

  async uploadFile(file: BufferedFile, user: { email: string }) {
    const safeEmail = user.email.replace(/@/g, '_at_').replace(/\./g, '_dot_');
    const objectName = `${safeEmail}/${Date.now()}-${file.originalname}`;
    await this.minioClient.putObject(
      process.env.MINIO_BUCKET_NAME,
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
  }
    async getUserFiles(user: { email: string }) {
    const safeEmail = user.email.replace(/@/g, '_at_').replace(/\./g, '_dot_');
    const files: any[] = [];
    const prifix = `${safeEmail}/`;
    const stream = await this.minioClient.listObjectsV2(
      process.env.MINIO_BUCKET_NAME,
      prifix,
      true,
    );
    for await (const obj of stream as AsyncIterable<BucketItem>) {
      if (obj.name && !obj.name?.endsWith('/')) {
        try {
          const expiry = parseInt(process.env.MINIO_FILE_EXPIRES, 10);

          const presignedUrl = await this.minioClient.presignedGetObject(
            process.env.MINIO_BUCKET_NAME,
            obj.name,
            expiry,
          );

      

          files.push({
            filename: obj.name.substring(prifix.length),
            expiresAt: new Date(Date.now() + expiry * 1000).toISOString(),
            expires_in_seconds: expiry,
            url: presignedUrl,
            size: obj.size,
            lastModified: obj.lastModified,
          });
        } catch (error) {}
      }
    }
    return files;
  }
}
