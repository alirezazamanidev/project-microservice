import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
  @ApiProperty({
    description: 'مسیر ذخیره‌سازی فایل روی سرور',
    example: 'uploads/images/profile_12345.png',
  })
  filePath: string;

  @ApiProperty({
    description: 'اندازه فایل به بایت (Bytes)',
    example: 204800, // حدوداً 200 کیلوبایت
  })
  size: number;

  @ApiProperty({
    description: 'نوع MIME فایل',
    example: 'image/png',
  })
  mimetype: string;

  @ApiProperty({
    description: 'نام اصلی فایل که توسط کاربر آپلود شده',
    example: 'avatar.png',
  })
  originalname: string;
}

export class PresignedFileDto {
  @ApiProperty({
    example: 'uploads/image.png',
    description: 'The internal file path on the server or storage system.',
  })
  filePath: string;

  @ApiProperty({
    example: 204800,
    description: 'The size of the file in bytes.',
  })
  size: number;

  @ApiProperty({
    example: 'image/png',
    description: 'The MIME type of the file.',
  })
  mimetype: string;

  @ApiProperty({
    example: 'my-image.png',
    description: 'The original filename uploaded by the user.',
  })
  originalname: string;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/bucket/uploads/image.png?signature=...',
    description: 'The temporary pre-signed URL to access or download the file.',
  })
  url: string;

  @ApiProperty({
    example: '2025-06-02T12:34:56.000Z',
    description: 'The exact expiration time of the pre-signed URL (in ISO format).',
  })
  expiresAt: string;

  @ApiProperty({
    example: 3600,
    description: 'The remaining time before the URL expires, in seconds.',
  })
  expires_in_seconds: number;

  @ApiProperty({
    example: '2025-05-31T10:22:00.000Z',
    description: 'The last modified timestamp of the file (in ISO format).',
  })
  lastModified: string;
}
