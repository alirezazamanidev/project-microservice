import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
import { IsAuthenticated } from '../auth/decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { UploadFileDto } from './dtos/upload-file.dto';
import { PatternNameEnum } from 'src/common/enums/pattern.enum';
@ApiTags('File')
@IsAuthenticated()
@Controller('file')
export class FileController {
  constructor(
    @Inject('FILE_SERVICE') private readonly fileClientService: ClientProxy,
  ) {}

  @ApiOperation({ summary: 'uploaded file' })
  @ApiBody({ type: UploadFileDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'application/pdf'];
        if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Invalid file type'), false);
      },
    }),
  )
  @Post('upload')
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const result = await lastValueFrom(
      this.fileClientService.send(PatternNameEnum.UPLOAD_FILE, {
        file,
        user: req.user,
      }),
    );
    return result
  }
}
