import { UPLOAD_CONFIG } from '../utils/constants.js';

export interface GpxValidationResult {
  valid: boolean;
  error?: string;
}

export function validateGpxFile(file: Express.Multer.File | undefined): GpxValidationResult {
  if (!file) {
    return { valid: false, error: 'No GPX file provided' };
  }

  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  const extension = file.originalname.toLowerCase().slice(-4);
  if (!UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(extension as '.gpx')) {
    return {
      valid: false,
      error: 'File must be a .gpx file',
    };
  }

  const content = file.buffer.toString('utf-8');
  if (!content.includes('<gpx') || !content.includes('</gpx>')) {
    return {
      valid: false,
      error: 'Invalid GPX file format',
    };
  }

  return { valid: true };
}

export function extractGpxContent(file: Express.Multer.File): string {
  return file.buffer.toString('utf-8');
}