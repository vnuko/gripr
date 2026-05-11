import { AppError } from './app-error.js';

export class GpxError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'gpx_parse_error', details);
  }
}

export function createGpxError(message: string, details?: Record<string, unknown>): GpxError {
  return new GpxError(message, details);
}

export function gpxFileMissing(): GpxError {
  return new GpxError('No GPX file provided');
}

export function gpxFileTooLarge(maxSizeMB: number): GpxError {
  return new GpxError(`File size exceeds maximum of ${maxSizeMB}MB`);
}

export function gpxInvalidFormat(): GpxError {
  return new GpxError('Invalid GPX file format');
}

export function gpxParseFailure(originalError: Error): GpxError {
  return new GpxError(`Failed to parse GPX: ${originalError.message}`, {
    originalError: originalError.message,
  });
}