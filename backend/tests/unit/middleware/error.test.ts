import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { errorMiddleware } from '../../../src/middleware/error.middleware.js';
import { notFoundMiddleware } from '../../../src/middleware/not-found.middleware.js';
import { AppError, createAppError } from '../../../src/errors/app-error.js';
import { ValidationError, createValidationError } from '../../../src/errors/validation-error.js';
import { GpxError, gpxFileMissing } from '../../../src/errors/gpx-error.js';

describe('Error Middleware', () => {
  function createTestApp(): express.Application {
    const app = express();
    app.use(express.json());

    app.get('/throw-app-error', (_req, _res, next) => {
      next(createAppError('Test app error', 400, 'bad_request'));
    });

    app.get('/throw-validation-error', (_req, _res, next) => {
      next(createValidationError([{ field: 'test', message: 'Invalid value' }]));
    });

    app.get('/throw-gpx-error', (_req, _res, next) => {
      next(gpxFileMissing());
    });

    app.get('/throw-generic-error', (_req, _res, next) => {
      next(new Error('Generic error'));
    });

    app.get('/throw-syntax-error', (_req, _res, next) => {
      const syntaxError = new SyntaxError('Unexpected token');
      (syntaxError as unknown as Record<string, unknown>).body = 'invalid';
      next(syntaxError);
    });

    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    return app;
  }

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('AppError handling', () => {
    it('should return formatted error response', async () => {
      const app = createTestApp();

      const response = await request(app).get('/throw-app-error');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('bad_request');
      expect(response.body.message).toBe('Test app error');
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('ValidationError handling', () => {
    it('should include validation details', async () => {
      const app = createTestApp();

      const response = await request(app).get('/throw-validation-error');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('validation_error');
    });
  });

  describe('GpxError handling', () => {
    it('should return GPX-specific error', async () => {
      const app = createTestApp();

      const response = await request(app).get('/throw-gpx-error');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('gpx_parse_error');
    });
  });

  describe('Generic error handling', () => {
    it('should convert to internal error', async () => {
      const app = createTestApp();

      const response = await request(app).get('/throw-generic-error');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('internal_error');
    });

    it('should handle syntax error as bad request', async () => {
      const app = createTestApp();

      const response = await request(app).get('/throw-syntax-error');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('bad_request');
    });
  });

  describe('Not found handling', () => {
    it('should return 404 for unknown routes', async () => {
      const app = createTestApp();

      const response = await request(app).get('/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('not_found');
      expect(response.body.message).toContain('not found');
    });
  });
});