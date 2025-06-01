import { Controller, Get, Inject, UseFilters } from '@nestjs/common';
import { FileService } from './file.service';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
@ApiTags('File')
@Controller('file')
export class FileController {
  constructor(
    @Inject('FILE_SERVICE') private readonly fileClientService: ClientProxy,
  ) {}

  @Get('test')
  async test() {
    const result = await lastValueFrom(
      this.fileClientService.send('test', { msg: 'TEST' })
    );
    return result;
  }
}
