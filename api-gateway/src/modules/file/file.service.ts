import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectFileClient } from '../../common/decorators/inject-client.decorator';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FileService {
  constructor(@InjectFileClient() private readonly fileClient: ClientProxy) {}

  async uploadFile(fileDto: any) {
    try {
      return await firstValueFrom(this.fileClient.send('file.upload', fileDto));
    } catch (error) {
      throw error;
    }
  }

  async getFile(fileId: string) {
    try {
      return await firstValueFrom(this.fileClient.send('file.get', { fileId }));
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(fileId: string) {
    try {
      return await firstValueFrom(
        this.fileClient.send('file.delete', { fileId }),
      );
    } catch (error) {
      throw error;
    }
  }

  async listFiles(userId?: string) {
    try {
      return await firstValueFrom(
        this.fileClient.send('file.list', { userId }),
      );
    } catch (error) {
      throw error;
    }
  }
}
