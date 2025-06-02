import { Controller, Get, HttpStatus } from '@nestjs/common';
import { FileService } from './file.service';
import { Ctx, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices';
import { PatternNameEnum } from './common/enums/pattern.enum';
import { BufferedFile } from './common/interfaces/file.interface';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @MessagePattern(PatternNameEnum.UPLOAD_FILE)
  async uploadFile(@Payload() data:{file:BufferedFile,user:{email:string}},@Ctx() ctx:RmqContext){
    // console.log(ctx.getMessage());
    
    return this.fileService.uploadFile(data.file,data.user);
  }
  

  
    @MessagePattern(PatternNameEnum.LIST_FILES)
    async getUserFiles(data: {user:{email:string}}) {
        return this.fileService.getUserFiles(data.user);
    }

    @MessagePattern('test')
    async test(data:any){
      await  new Promise((resolve) => setTimeout(resolve,3000));
      return data
    }



}
