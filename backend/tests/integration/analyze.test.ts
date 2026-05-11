import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import * as path from 'path';
import * as fs from 'fs';

vi.mock('../../src/services/ai/openai.service.js', async () => {
  const actual = await vi.importActual('../../src/services/ai/openai.service.js');
  return {
    ...actual,
    callOpenAI: vi.fn().mockResolvedValue({
      success: true,
      recommendation: {
        frontPsi: 21,
        rearPsi: 24,
        reasoning: 'Mock AI validation for testing',
        confidence: 'high',
      },
    }),
  };
});

vi.mock('../../src/services/osm/osm-client.service.js', async () => {
  const actual = await vi.importActual('../../src/services/osm/osm-client.service.js');
  return {
    ...actual,
    queryOsmWays: vi.fn().mockResolvedValue({
      elements: [],
    }),
  };
});

describe('Analyze Endpoint Integration', () => {
  const app = createApp();

  function getFixturePath(filename: string): string {
    return path.join(__dirname, '..', 'fixtures', filename);
  }

  describe('POST /api/analyze - Success Cases', () => {
    it('should return complete analysis for trail bike', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('sample-route.gpx'))
        .field('riderWeight', '82')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.4')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty('baseline');
      expect(response.body).toHaveProperty('adjusted');
      expect(response.body).toHaveProperty('aiRecommendation');
      expect(response.body).toHaveProperty('routeMetrics');

      expect(response.body.baseline).toHaveProperty('frontPsi');
      expect(response.body.baseline).toHaveProperty('rearPsi');
      expect(typeof response.body.baseline.frontPsi).toBe('number');

      expect(response.body.aiRecommendation).toHaveProperty('frontPsi');
      expect(response.body.aiRecommendation).toHaveProperty('rearPsi');
      expect(response.body.aiRecommendation).toHaveProperty('reasoning');
      expect(response.body.aiRecommendation).toHaveProperty('confidence');
    });

    it('should return correct metrics for advanced trail', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('trail-advanced.gpx'))
        .field('riderWeight', '75')
        .field('bikeType', 'enduro')
        .field('tireWidth', '2.5')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(200);

      expect(response.body.routeMetrics.elevationLoss).toBeGreaterThan(0);
    });

    it('should classify long gravel ride for gravel bike', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('gravel-long.gpx'))
        .field('riderWeight', '80')
        .field('bikeType', 'gravel')
        .field('tireWidth', '2.0')
        .field('tubeless', 'true')
        .field('ridingStyle', 'moderate');

      expect(response.status).toBe(200);
    });

    it('should handle conservative riding style', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('minimal.gpx'))
        .field('riderWeight', '60')
        .field('bikeType', 'xc')
        .field('tireWidth', '2.2')
        .field('tubeless', 'false')
        .field('ridingStyle', 'conservative');

      expect(response.status).toBe(200);

      expect(response.body.baseline.frontPsi).toBeDefined();
    });

    it('should handle minimal GPX with few points', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('minimal.gpx'))
        .field('riderWeight', '70')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.3')
        .field('tubeless', 'true')
        .field('ridingStyle', 'moderate');

      expect(response.status).toBe(200);
      expect(response.body.routeMetrics).toBeDefined();
    });
  });

  describe('POST /api/analyze - Error Cases', () => {
    it('should reject missing GPX file', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .field('riderWeight', '82')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.4')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('gpx_parse_error');
      expect(response.body.message).toContain('No GPX file');
    });

    it('should reject invalid GPX format', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('invalid.gpx'))
        .field('riderWeight', '82')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.4')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('gpx_parse_error');
    });

    it('should reject invalid bike type', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('sample-route.gpx'))
        .field('riderWeight', '82')
        .field('bikeType', 'invalid')
        .field('tireWidth', '2.4')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('validation_error');
      expect(response.body.details).toBeDefined();
    });

    it('should reject rider weight below minimum', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('sample-route.gpx'))
        .field('riderWeight', '30')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.4')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('validation_error');
    });

    it('should reject rider weight above maximum', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('sample-route.gpx'))
        .field('riderWeight', '200')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.4')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(400);
    });

    it('should reject tire width below minimum', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('sample-route.gpx'))
        .field('riderWeight', '82')
        .field('bikeType', 'trail')
        .field('tireWidth', '1.0')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('sample-route.gpx'))
        .field('riderWeight', '82');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('validation_error');
    });

    it('should reject non-GPX file extension', async () => {
      const txtPath = path.join(__dirname, '..', 'fixtures', 'test.txt');
      fs.writeFileSync(txtPath, 'not a gpx file');

      const response = await request(app)
        .post('/api/analyze')
        .attach('file', txtPath)
        .field('riderWeight', '82')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.4')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('invalid_file');

      fs.unlinkSync(txtPath);
    });
  });

  describe('POST /api/analyze - Edge Cases', () => {
    it('should handle string numbers in form data', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('sample-route.gpx'))
        .field('riderWeight', '82.5')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.4')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(200);
    });

    it('should handle heavy rider adjustment', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('sample-route.gpx'))
        .field('riderWeight', '105')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.4')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(200);
      expect(response.body.baseline.frontPsi).toBeGreaterThan(22);
    });

    it('should handle wide tire adjustment', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('sample-route.gpx'))
        .field('riderWeight', '82')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.8')
        .field('tubeless', 'true')
        .field('ridingStyle', 'moderate');

      expect(response.status).toBe(200);
      expect(response.body.baseline.frontPsi).toBeDefined();
    });

    it('should handle downhill bike type', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('trail-advanced.gpx'))
        .field('riderWeight', '90')
        .field('bikeType', 'downhill')
        .field('tireWidth', '2.5')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(200);
      expect(response.body.baseline.frontPsi).toBeDefined();
    });
  });

  describe('Analyze Endpoint V2', () => {
    it('should return terrain profile with composition', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('sample-route.gpx'))
        .field('riderWeight', '82')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.4')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(200);
      expect(response.body.inputMode).toBe('gpx');
      expect(response.body.terrainProfile).toBeDefined();
      expect(response.body.terrainProfile.composition).toBeDefined();
      
      const composition = response.body.terrainProfile.composition;
      expect(composition).toHaveProperty('asphalt');
      expect(composition).toHaveProperty('gravel');
      expect(composition).toHaveProperty('dirt');
      expect(composition).toHaveProperty('rocky');
      expect(composition).toHaveProperty('technical');
    });

    it('should return terrain scores', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('sample-route.gpx'))
        .field('riderWeight', '82')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.4')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(200);
      
      const scores = response.body.terrainProfile.scores;
      expect(scores).toHaveProperty('roughness');
      expect(scores).toHaveProperty('technicality');
      expect(scores).toHaveProperty('flow');
      
      expect(scores.roughness).toBeGreaterThanOrEqual(0);
      expect(scores.roughness).toBeLessThanOrEqual(1);
    });

    it('should return OSM enrichment status', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('sample-route.gpx'))
        .field('riderWeight', '82')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.4')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(200);
      expect(response.body.osmEnrichmentStatus).toBeDefined();
      
      const status = response.body.osmEnrichmentStatus;
      expect(status).toHaveProperty('osmAvailable');
      expect(status).toHaveProperty('segmentsProcessed');
    });

    it('should return terrain-based adjustment details', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .attach('file', getFixturePath('sample-route.gpx'))
        .field('riderWeight', '82')
        .field('bikeType', 'trail')
        .field('tireWidth', '2.4')
        .field('tubeless', 'true')
        .field('ridingStyle', 'aggressive');

      expect(response.status).toBe(200);
      expect(response.body.terrainBased).toBeDefined();
      
      const terrainBased = response.body.terrainBased;
      expect(terrainBased.composition).toBeDefined();
      expect(terrainBased.appliedWeights).toBeDefined();
      expect(Array.isArray(terrainBased.appliedWeights)).toBe(true);
    });
  });

  describe('Manual Terrain Mode', () => {
    it('should accept manual terrain input via JSON', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          riderWeight: 82,
          bikeType: 'trail',
          tireWidth: 2.4,
          tubeless: true,
          ridingStyle: 'aggressive',
          manualTerrain: {
            gravel: 0.6,
            dirt: 0.3,
            rocky: 0.1,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.inputMode).toBe('manual');
      expect(response.body.terrainProfile).toBeDefined();
    });

    it('should normalize terrain percentages', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          riderWeight: 82,
          bikeType: 'trail',
          tireWidth: 2.4,
          tubeless: true,
          ridingStyle: 'aggressive',
          manualTerrain: {
            gravel: 1,
            rocky: 1,
          },
        });

      expect(response.status).toBe(200);
      
      const composition = response.body.terrainProfile.composition;
      const sum = Object.values(composition).reduce((a: number, b: number) => a + b, 0);
      expect(sum).toBeCloseTo(1, 5);
    });

    it('should handle single terrain type', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          riderWeight: 75,
          bikeType: 'gravel',
          tireWidth: 2.2,
          tubeless: true,
          ridingStyle: 'moderate',
          manualTerrain: {
            gravel: 1,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.terrainProfile.composition.gravel).toBeCloseTo(1, 2);
    });

    it('should calculate scores from manual composition', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          riderWeight: 82,
          bikeType: 'trail',
          tireWidth: 2.4,
          tubeless: true,
          ridingStyle: 'aggressive',
          manualTerrain: {
            rocky: 0.5,
            technical: 0.5,
          },
        });

      expect(response.status).toBe(200);
      
      expect(response.body.terrainProfile.scores.roughness).toBeGreaterThan(0.5);
    });

    it('should mark manual mode in enrichment status', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          riderWeight: 82,
          bikeType: 'trail',
          tireWidth: 2.4,
          tubeless: true,
          ridingStyle: 'aggressive',
          manualTerrain: {
            gravel: 0.5,
            dirt: 0.5,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.osmEnrichmentStatus.fallbackMode).toBe('manual');
      expect(response.body.osmEnrichmentStatus.osmAvailable).toBe(false);
    });

    it('should not return routeMetrics for manual mode', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          riderWeight: 82,
          bikeType: 'trail',
          tireWidth: 2.4,
          tubeless: true,
          ridingStyle: 'aggressive',
          manualTerrain: {
            gravel: 1,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.routeMetrics).toBeUndefined();
    });

    it('should reject manual terrain with all zeros', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          riderWeight: 82,
          bikeType: 'trail',
          tireWidth: 2.4,
          tubeless: true,
          ridingStyle: 'aggressive',
          manualTerrain: {
            asphalt: 0,
            gravel: 0,
            dirt: 0,
            rocky: 0,
            technical: 0,
          },
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid terrain percentage values', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          riderWeight: 82,
          bikeType: 'trail',
          tireWidth: 2.4,
          tubeless: true,
          ridingStyle: 'aggressive',
          manualTerrain: {
            gravel: 2,
          },
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Pressure Calculation with Terrain', () => {
    it('should apply terrain composition to pressure', async () => {
      const rockyResponse = await request(app)
        .post('/api/analyze')
        .send({
          riderWeight: 82,
          bikeType: 'trail',
          tireWidth: 2.4,
          tubeless: true,
          ridingStyle: 'aggressive',
          manualTerrain: {
            rocky: 1,
          },
        });

      expect(rockyResponse.status).toBe(200);

      const asphaltResponse = await request(app)
        .post('/api/analyze')
        .send({
          riderWeight: 82,
          bikeType: 'trail',
          tireWidth: 2.4,
          tubeless: true,
          ridingStyle: 'aggressive',
          manualTerrain: {
            asphalt: 1,
          },
        });

      expect(asphaltResponse.status).toBe(200);

      expect(rockyResponse.body.adjusted.frontPsi).toBeLessThan(
        asphaltResponse.body.adjusted.frontPsi
      );
    });

    it('should show applied weights in terrain-based adjustment', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          riderWeight: 82,
          bikeType: 'trail',
          tireWidth: 2.4,
          tubeless: true,
          ridingStyle: 'aggressive',
          manualTerrain: {
            gravel: 0.5,
            rocky: 0.5,
          },
        });

      expect(response.status).toBe(200);
      
      const weights = response.body.terrainBased.appliedWeights;
      expect(weights.length).toBe(2);
      
      expect(weights.find(w => w.surface === 'gravel')).toBeDefined();
      expect(weights.find(w => w.surface === 'rocky')).toBeDefined();
    });
  });
});