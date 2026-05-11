import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('Health Endpoint', () => {
  const app = createApp();

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
    });
  });

  describe('GET /openapi.json', () => {
    it('should return OpenAPI spec', async () => {
      const response = await request(app).get('/openapi.json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('openapi', '3.0.3');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info).toHaveProperty('title');
    });
  });

  describe('GET /api-docs', () => {
    it('should return Swagger UI HTML', async () => {
      const response = await request(app).get('/api-docs/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
    });
  });
});