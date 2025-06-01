import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
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
      message: 'File uploaded successfully',
      filePath: objectName,
      size: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname,
    };
  }
}
