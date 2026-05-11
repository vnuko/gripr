import multer from 'multer';
import { UPLOAD_CONFIG } from '../utils/constants.js';

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, callback) => {
    const extension = file.originalname.toLowerCase().slice(-4);
    if (extension === '.gpx') {
      callback(null, true);
    } else {
      callback(new Error('Only .gpx files are allowed'));
    }
  },
});

export const gpxUpload = uploadMiddleware.single('file');