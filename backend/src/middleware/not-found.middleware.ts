import { Request, Response, NextFunction } from 'express';
import { createAppError } from '../errors/app-error.js';

export function notFoundMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const error = createAppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    'not_found'
  );

  next(error);
}