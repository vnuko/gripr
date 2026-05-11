import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('OpenAPI Documentation', () => {
  const app = createApp();

  describe('GET /openapi.json', () => {
    it('should return valid OpenAPI spec', async () => {
      const response = await request(app).get('/openapi.json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('openapi', '3.0.3');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info).toHaveProperty('title');
      expect(response.body.info).toHaveProperty('version');
    });

    it('should include analyze endpoint schema', async () => {
      const response = await request(app).get('/openapi.json');

      expect(response.body.paths).toHaveProperty('/api/analyze');
      expect(response.body.paths['/api/analyze']).toHaveProperty('post');
    });

    it('should include component schemas', async () => {
      const response = await request(app).get('/openapi.json');

      expect(response.body.components).toHaveProperty('schemas');
      expect(response.body.components.schemas).toHaveProperty('AnalyzeResponse');
      expect(response.body.components.schemas).toHaveProperty('RiderInput');
    });

    it('should include error schema', async () => {
      const response = await request(app).get('/openapi.json');

      expect(response.body.components.schemas).toHaveProperty('Error');
    });
  });

  describe('GET /api-docs', () => {
    it('should return Swagger UI HTML', async () => {
      const response = await request(app).get('/api-docs/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.text).toContain('swagger');
    });
  });
});