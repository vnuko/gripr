export type ErrorCode =
  | 'internal_error'
  | 'validation_error'
  | 'invalid_file'
  | 'gpx_parse_error'
  | 'ai_error'
  | 'not_found'
  | 'bad_request';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = 'internal_error',
    details?: Record<string, unknown>,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    if (details !== undefined) {
      this.details = details;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

export function createAppError(
  message: string,
  statusCode: number = 500,
  code: ErrorCode = 'internal_error',
  details?: Record<string, unknown>
): AppError {
  return new AppError(message, statusCode, code, details);
}