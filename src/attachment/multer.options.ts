import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { v4 } from 'uuid';

import { AttachmentType } from './attachment.enum';

// Multer configuration
export const multerConfig: MulterOptions = {
  dest: join(process.cwd(), '.temp'),
};

const getFileLimitSize = (t: AttachmentType) => {
  switch (t) {
    case AttachmentType.IMAGE:
      return 3 * 1024 * 1024; // 3 Mb
    case AttachmentType.VIDEO:
      return 200 * 1024 * 1024; // 200 Mb
    default:
      return 1 * 1024 * 1024; // 1 Mb
  }
};

const getValidFileExt = (t: AttachmentType) => {
  switch (t) {
    case AttachmentType.IMAGE:
      return ['jpg', 'jpeg', 'png', 'gif'];
    case AttachmentType.VIDEO:
      return ['mp4'];
    default:
      return [];
  }
};

// Multer upload options
export const multerOptions = (fileType: AttachmentType) => ({
  limits: {
    fileSize: getFileLimitSize(fileType),
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    if (
      getValidFileExt(fileType).some((x) =>
        file.mimetype.match(new RegExp(x, 'gi')),
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          `Unsupported file type ${extname(file.originalname)}`,
        ),
        false,
      );
    }
  },
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const uploadPath = multerConfig.dest;
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: (req: any, file: any, cb: any) => {
      cb(null, `${v4()}${extname(file.originalname)}`);
    },
  }),
});
