import { Controller, Get, HttpStatus } from '@nestjs/common';
import { FileService } from './file.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { PatternNameEnum } from './common/enums/pattern.enum';
import { BufferedFile } from './common/interfaces/file.interface';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @MessagePattern(PatternNameEnum.UPLOAD_FILE)
  async uploadFile(@Payload() data:{file:BufferedFile,user:{email:string}}){

  }



}
