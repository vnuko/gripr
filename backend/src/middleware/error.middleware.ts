import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { MulterError } from 'multer';

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  stack?: string;
}

function formatErrorResponse(error: AppError, includeStack: boolean): ErrorResponse {
  const response: ErrorResponse = {
    error: error.code,
    message: error.message,
    statusCode: error.statusCode,
  };

  if (error.details !== undefined) {
    response.details = error.details;
  }

  if (includeStack && error.stack) {
    response.stack = error.stack;
  }

  return response;
}

function handleMulterError(error: MulterError): AppError {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return new AppError('File too large', 400, 'invalid_file');
    case 'LIMIT_UNEXPECTED_FILE':
      return new AppError('Unexpected file field', 400, 'invalid_file');
    case 'LIMIT_FILE_COUNT':
      return new AppError('Too many files', 400, 'invalid_file');
    default:
      return new AppError(`Upload error: ${error.message}`, 400, 'invalid_file');
  }
}

export function errorMiddleware(
  err: Error | AppError | MulterError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof MulterError) {
    appError = handleMulterError(err);
  } else if (err.message === 'Only .gpx files are allowed') {
    appError = new AppError(err.message, 400, 'invalid_file');
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    appError = new AppError('Invalid JSON in request body', 400, 'bad_request');
  } else {
    appError = new AppError(
      err.message || 'An unexpected error occurred',
      500,
      'internal_error',
      undefined,
      false
    );
  }

  console.error(`[${new Date().toISOString()}] Error:`, {
    code: appError.code,
    message: appError.message,
    statusCode: appError.statusCode,
    path: req.path,
    method: req.method,
    isOperational: appError.isOperational,
    stack: err.stack,
  });

  const includeStack = process.env.NODE_ENV === 'development';

  const response = formatErrorResponse(appError, includeStack);

  res.status(appError.statusCode).json(response);
}