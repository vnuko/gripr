import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildOverpassQuery,
  generateCacheKey,
  calculateBboxFromPoints,
  validateBbox,
  filterRelevantWays,
  clearCache,
  isCacheValid,
  cacheResponse,
  getCachedResponse,
  OsmClientError,
} from '../../../src/services/osm/osm-client.service.js';
import { mockOsmResponses } from '../../mocks/osm-response.mock.js';
import { OSM_CONFIG } from '../../../src/utils/constants.js';

describe('OSM Client Service', () => {
  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    clearCache();
  });

  describe('buildOverpassQuery', () => {
    it('should generate valid Overpass query', () => {
      const params = {
        bbox: { south: 47.0, west: 8.0, north: 48.0, east: 9.0 },
      };
      
      const query = buildOverpassQuery(params);
      
      expect(query).toContain('[out:json]');
      expect(query).toContain('way["highway"]');
      expect(query).toContain('(47,8,48,9)');
    });
  });

  describe('generateCacheKey', () => {
    it('should generate consistent key for same bbox', () => {
      const params = {
        bbox: { south: 47.0, west: 8.0, north: 48.0, east: 9.0 },
      };
      
      const key1 = generateCacheKey(params);
      const key2 = generateCacheKey(params);
      
      expect(key1).toBe(key2);
      expect(key1).toContain('bbox:');
    });
  });

  describe('calculateBboxFromPoints', () => {
    it('should calculate correct bbox with padding', () => {
      const points = [
        { lat: 47.3769, lon: 8.5417 },
        { lat: 47.3770, lon: 8.5418 },
      ];
      
      const bbox = calculateBboxFromPoints(points, 0.5);
      
      expect(bbox.south).toBeLessThan(47.3769);
      expect(bbox.north).toBeGreaterThan(47.3770);
      expect(bbox.west).toBeLessThan(8.5417);
      expect(bbox.east).toBeGreaterThan(8.5418);
    });

    it('should throw error for empty points', () => {
      expect(() => calculateBboxFromPoints([])).toThrow(OsmClientError);
    });
  });

  describe('validateBbox', () => {
    it('should accept valid bbox', () => {
      const bbox = { south: 47.0, west: 8.0, north: 47.1, east: 8.1 };
      
      expect(validateBbox(bbox)).toBe(true);
    });

    it('should reject bbox larger than max area', () => {
      const bbox = { south: 45.0, west: 5.0, north: 55.0, east: 15.0 };
      
      expect(validateBbox(bbox)).toBe(false);
    });
  });

  describe('filterRelevantWays', () => {
    it('should filter to relevant highway types', () => {
      const response = mockOsmResponses.mixedTerrain();
      
      const filtered = filterRelevantWays(response.elements);
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(w => w.tags?.highway)).toBe(true);
    });

    it('should exclude non-way elements', () => {
      const elements = [
        { id: 1, type: 'node', lat: 47.0, lon: 8.0 },
        ...mockOsmResponses.mixedTerrain().elements,
      ];
      
      const filtered = filterRelevantWays(elements as any);
      
      expect(filtered.every(el => el.type === 'way')).toBe(true);
    });
  });

  describe('Cache operations', () => {
    it('should cache and retrieve response', () => {
      const key = 'test-key';
      const data = mockOsmResponses.asphaltOnly();
      
      cacheResponse(key, data);
      
      expect(isCacheValid(key)).toBe(true);
      expect(getCachedResponse(key)).toEqual(data);
    });

    it('should return null for invalid cache', () => {
      const key = 'nonexistent-key';
      
      expect(isCacheValid(key)).toBe(false);
      expect(getCachedResponse(key)).toBeNull();
    });
  });
});