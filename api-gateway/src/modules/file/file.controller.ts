import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiGatewayTimeoutResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
import { IsAuthenticated } from '../auth/decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { UploadFileDto } from './dtos/upload-file.dto';
import { PatternNameEnum } from 'src/common/enums/pattern.enum';
import { FileDto, PresignedFileDto } from './dtos/file.dto';
import { ErrorResponseDto } from 'src/common/dtos/base-error-response.dto';
import {
  FileUploadOperation,
  FileListOperation,
} from './decorators/file-swagger.decorators';

@ApiTags('File')
@IsAuthenticated()
@Controller('file')
export class FileController {
  constructor(
    @Inject('FILE_SERVICE') private readonly fileClientService: ClientProxy,
  ) {}

  @FileUploadOperation()
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
        user: { email: req.session?.user?.email },
      }),
    );
    return {
      message: 'uploaded file successFully',
      data: result,
    };
  }

  @FileListOperation()
  @Get('list')
  async listUserFiles(@Req() req: Request) {
    const result = await lastValueFrom(
      this.fileClientService.send(PatternNameEnum.LIST_FILES, {
        user: { email: req.session.user?.email },
      }),
    );
    return {
      message: 'list files user',
      data: result,
    };
  }
}
