import { AppError } from './app-error.js';
import type { ZodError } from 'zod';

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

export class ValidationError extends AppError {
  public readonly validationErrors: ValidationErrorDetail[];

  constructor(errors: ValidationErrorDetail[]) {
    super('Request validation failed', 400, 'validation_error', { errors });
    this.validationErrors = errors;
  }
}

export function createValidationError(errors: ValidationErrorDetail[]): ValidationError {
  return new ValidationError(errors);
}

export function fromZodError(zodError: ZodError): ValidationError {
  const errors: ValidationErrorDetail[] = zodError.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return new ValidationError(errors);
}