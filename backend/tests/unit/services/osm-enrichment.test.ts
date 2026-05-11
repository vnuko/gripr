import { describe, it, expect } from 'vitest';
import {
  classifySurfaceType,
  determineEnrichmentConfidence,
  calculateRoughnessFromTags,
  enrichSegment,
  createFallbackSegment,
} from '../../../src/services/osm/osm-enrichment.service.js';
import type { OsmSegment, OsmTags, SurfaceType } from '../../../src/services/osm/osm.types.js';

describe('OSM Enrichment Service', () => {
  describe('classifySurfaceType', () => {
    it('should classify asphalt from surface tag', () => {
      const tags: OsmTags = { surface: 'asphalt' };
      
      expect(classifySurfaceType(tags)).toBe('asphalt');
    });

    it('should classify gravel from surface tag', () => {
      const tags: OsmTags = { surface: 'gravel' };
      
      expect(classifySurfaceType(tags)).toBe('gravel');
    });

    it('should classify technical from MTB scale', () => {
      const tags: OsmTags = { mtbScale: '3' };
      
      expect(classifySurfaceType(tags)).toBe('technical');
      
      const tags4: OsmTags = { mtbScale: '4' };
      expect(classifySurfaceType(tags4)).toBe('technical');
    });

    it('should classify from highway type when no surface', () => {
      const tags: OsmTags = { highway: 'track' };
      
      expect(classifySurfaceType(tags)).toBe('gravel');
      
      const tagsPath: OsmTags = { highway: 'path' };
      expect(classifySurfaceType(tagsPath)).toBe('dirt');
    });

    it('should prioritize surface over highway', () => {
      const tags: OsmTags = { surface: 'rock', highway: 'track' };
      
      expect(classifySurfaceType(tags)).toBe('rocky');
    });

    it('should use smoothness as fallback', () => {
      const tags: OsmTags = { smoothness: 'bad' };
      
      expect(classifySurfaceType(tags)).toBe('dirt');
      
      const tagsVeryBad: OsmTags = { smoothness: 'very_bad' };
      expect(classifySurfaceType(tagsVeryBad)).toBe('technical');
    });

    it('should return dirt as default', () => {
      const tags: OsmTags = {};
      
      expect(classifySurfaceType(tags)).toBe('dirt');
    });
  });

  describe('determineEnrichmentConfidence', () => {
    it('should return high for explicit surface with close match', () => {
      const tags: OsmTags = { surface: 'gravel' };
      
      expect(determineEnrichmentConfidence(tags, 5)).toBe('high');
    });

    it('should return medium for highway with moderate distance', () => {
      const tags: OsmTags = { highway: 'track' };
      
      expect(determineEnrichmentConfidence(tags, 15)).toBe('medium');
    });

    it('should return low for minimal tags', () => {
      const tags: OsmTags = {};
      
      expect(determineEnrichmentConfidence(tags, 25)).toBe('low');
    });
  });

  describe('calculateRoughnessFromTags', () => {
    it('should return low roughness for smooth surfaces', () => {
      const tags: OsmTags = { smoothness: 'excellent' };
      
      expect(calculateRoughnessFromTags(tags)).toBeCloseTo(0.1, 1);
    });

    it('should return high roughness for rough surfaces', () => {
      const tags: OsmTags = { smoothness: 'horrible' };
      
      expect(calculateRoughnessFromTags(tags)).toBeCloseTo(0.9, 1);
    });

    it('should factor MTB scale', () => {
      const tags: OsmTags = { mtbScale: '5' };
      
      expect(calculateRoughnessFromTags(tags)).toBeGreaterThanOrEqual(0.95);
    });

    it('should reduce roughness for asphalt', () => {
      const tags: OsmTags = { surface: 'asphalt' };
      
      expect(calculateRoughnessFromTags(tags)).toBeLessThanOrEqual(0.2);
    });
  });

  describe('enrichSegment', () => {
    it('should enrich matched segment correctly', () => {
      const segment: OsmSegment = {
        lat: 47.3769,
        lon: 8.5417,
        osmId: 'way/123',
        highway: 'track',
        surface: 'gravel',
        distanceFromPoint: 8,
      };
      
      const enrichment = enrichSegment(segment, 0);
      
      expect(enrichment.segmentIndex).toBe(0);
      expect(enrichment.classifiedSurface).toBe('gravel');
      expect(enrichment.confidence).toBe('high');
      expect(enrichment.fallbackUsed).toBe(false);
      expect(enrichment.osmTags.surface).toBe('gravel');
    });
  });

  describe('createFallbackSegment', () => {
    it('should create fallback with default dirt surface', () => {
      const point = { lat: 47.3769, lon: 8.5417, index: 0 };
      
      const fallback = createFallbackSegment(point);
      
      expect(fallback.segmentIndex).toBe(0);
      expect(fallback.classifiedSurface).toBe('dirt');
      expect(fallback.confidence).toBe('low');
      expect(fallback.fallbackUsed).toBe(true);
    });

    it('should create fallback with specified surface', () => {
      const point = { lat: 47.3769, lon: 8.5417, index: 0 };
      
      const fallback = createFallbackSegment(point, 'rocky');
      
      expect(fallback.classifiedSurface).toBe('rocky');
    });
  });
});