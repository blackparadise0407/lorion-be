import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AttachmentType } from './attachment.enum';
import { AttachmentService } from './attachment.service';
import { multerOptions } from './multer.options';

@Controller('attachment')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file', multerOptions(AttachmentType.IMAGE)))
  public upload(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }
}
