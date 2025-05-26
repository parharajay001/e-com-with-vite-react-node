import fs from 'fs';
import path from 'path';
import { RequestHandler } from 'express';
import multer from 'multer';

interface UploadConfig {
  type: 'product' | 'category' | 'profile';
  maxCount?: number;
  fieldName?: string;
}

const createStorage = (type: UploadConfig['type']) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Base upload directory
      const baseDir = 'uploads/images';

      // Construct the path based on upload type
      let uploadPath: string;
      switch (type) {
        case 'product':
          uploadPath = path.join(baseDir, 'product', req.params.id || '');
          break;
        case 'category':
          uploadPath = path.join(baseDir, 'category', req.params.id || '');
          break;
        case 'profile':
          uploadPath = path.join(baseDir, 'profile', req.params.id || '');
          break;
        default:
          uploadPath = path.join(baseDir, 'misc');
      }

      // Create the directory if it doesn't exist
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
};

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP images are allowed.'));
  }
};

export const configureUpload = (config: UploadConfig): RequestHandler => {
  const upload = multer({
    storage: createStorage(config.type),
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  // Determine whether to use single or array based on type and maxCount
  if (config.maxCount && config.maxCount > 1) {
    return upload.array(config.fieldName || 'images', config.maxCount);
  }
  return upload.single(config.fieldName || 'image');
};

// Preconfigured upload middlewares
export const uploadProductImages: RequestHandler = configureUpload({
  type: 'product',
  maxCount: 10,
  fieldName: 'images',
});

export const uploadCategoryImage: RequestHandler = configureUpload({
  type: 'category',
  fieldName: 'image',
});

export const uploadProfileImage: RequestHandler = configureUpload({
  type: 'profile',
  fieldName: 'image',
});
