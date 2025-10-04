import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Express } from 'express'; // Only for type usage

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/kyc/');
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and PDF files are allowed.'));
  }
};


// File filter to allow only images
// const fileFilter = (
//   req: Request,
//   file: Express.Multer.File,
//   cb: multer.FileFilterCallback
// ) => {
//   const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and PDF files are allowed.'));
//   }
// };

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export { upload };
