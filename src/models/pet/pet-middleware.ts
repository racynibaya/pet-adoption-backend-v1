import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback, MulterError } from 'multer';

import { BadRequestError } from '@utils/error';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FILE_COUNT = 10;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new BadRequestError(`Unsupported image type: ${file.mimetype}`));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_FILE_COUNT },
});

const multerArray = upload.array('images', MAX_FILE_COUNT);

export const uploadPetImages = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  multerArray(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof MulterError) {
      return next(new BadRequestError(`Upload error: ${err.message}`));
    }
    next(err);
  });
};
