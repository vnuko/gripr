import { describe, it, expect } from 'vitest';
import {
  calculateSegmentGradient,
  determineSegmentLength,
  findSegmentEndIndex,
  createTerrainSegment,
  segmentRoute,
  getTerrainTimelineSummary,
} from '../../../src/services/terrain/terrain-segmentation.service.js';
import type { ParsedTrackPoint, SegmentEnrichment, SurfaceType } from '../../../src/services/osm/osm.types.js';

describe('Terrain Segmentation Service', () => {
  describe('calculateSegmentGradient', () => {
    it('should calculate positive gradient for ascent', () => {
      const gradient = calculateSegmentGradient(100, 150, 500);
      
      expect(gradient).toBeCloseTo(10, 1);
    });

    it('should calculate negative gradient for descent', () => {
      const gradient = calculateSegmentGradient(150, 100, 500);
      
      expect(gradient).toBeCloseTo(-10, 1);
    });

    it('should return 0 for missing elevation', () => {
      expect(calculateSegmentGradient(null, 100, 500)).toBe(0);
      expect(calculateSegmentGradient(100, null, 500)).toBe(0);
    });

    it('should return 0 for zero distance', () => {
      expect(calculateSegmentGradient(100, 150, 0)).toBe(0);
    });
  });

  describe('determineSegmentLength', () => {
    const createPoints = (count: number, spacing: number): ParsedTrackPoint[] => {
      const points: ParsedTrackPoint[] = [];
      for (let i = 0; i < count; i++) {
        points.push({
          latitude: 47.3769 + i * spacing / 111000,
          longitude: 8.5417,
          elevation: 450 + i * 5,
          timestamp: null,
        });
      }
      return points;
    };

    it('should return minimum for high density points', () => {
      const points = createPoints(20, 5);
      const length = determineSegmentLength(points, 0);
      
      expect(length).toBeGreaterThanOrEqual(50);
    });

    it('should return maximum for low density points', () => {
      const points = createPoints(10, 100);
      const length = determineSegmentLength(points, 0);
      
      expect(length).toBeLessThanOrEqual(200);
    });

    it('should return 0 for few remaining points', () => {
      const points = createPoints(10, 20);
      const length = determineSegmentLength(points, 8);
      
      expect(length).toBe(0);
    });
  });

  describe('findSegmentEndIndex', () => {
    it('should find index achieving target length', () => {
      const points: ParsedTrackPoint[] = [
        { latitude: 47.3769, longitude: 8.5417, elevation: 450, timestamp: null },
        { latitude: 47.3770, longitude: 8.5418, elevation: 455, timestamp: null },
        { latitude: 47.3771, longitude: 8.5419, elevation: 460, timestamp: null },
        { latitude: 47.3772, longitude: 8.5420, elevation: 465, timestamp: null },
      ];
      
      const endIndex = findSegmentEndIndex(points, 0, 30);
      
      expect(endIndex).toBeGreaterThan(0);
      expect(endIndex).toBeLessThan(points.length);
    });

    it('should return last point when target exceeds route', () => {
      const points: ParsedTrackPoint[] = [
        { latitude: 47.3769, longitude: 8.5417, elevation: 450, timestamp: null },
        { latitude: 47.3770, longitude: 8.5418, elevation: 455, timestamp: null },
      ];
      
      const endIndex = findSegmentEndIndex(points, 0, 1000);
      
      expect(endIndex).toBe(points.length - 1);
    });
  });

  describe('createTerrainSegment', () => {
    it('should create segment with correct properties', () => {
      const enrichment: SegmentEnrichment = {
        segmentIndex: 0,
        startLat: 47.3769,
        startLon: 8.5417,
        endLat: 47.3770,
        endLon: 8.5418,
        distance: 15,
        classifiedSurface: 'gravel',
        osmTags: { surface: 'gravel' },
        confidence: 'high',
        fallbackUsed: false,
      };
      
      const start = { lat: 47.3769, lon: 8.5417, elevation: 450 };
      const end = { lat: 47.3770, lon: 8.5418, elevation: 455 };
      
      const segment = createTerrainSegment(enrichment, start, end, 15, 0);
      
      expect(segment.index).toBe(0);
      expect(segment.surface).toBe('gravel');
      expect(segment.distance).toBe(15);
      expect(segment.confidence).toBe('high');
      expect(segment.gradient).toBeCloseTo(33.3, 0);
    });
  });

  describe('segmentRoute', () => {
    it('should segment route into multiple segments', () => {
      const points: ParsedTrackPoint[] = Array.from({ length: 50 }, (_, i) => ({
        latitude: 47.3769 + i * 0.001,
        longitude: 8.5417 + i * 0.001,
        elevation: 450 + i * 5,
        timestamp: null,
      }));
      
      const enrichments: SegmentEnrichment[] = points.map((p, i) => ({
        segmentIndex: i,
        startLat: p.latitude,
        startLon: p.longitude,
        endLat: p.latitude,
        endLon: p.longitude,
        distance: 0,
        classifiedSurface: (i % 2 === 0 ? 'gravel' : 'dirt') as SurfaceType,
        osmTags: {},
        confidence: 'high',
        fallbackUsed: false,
      }));
      
      const segments = segmentRoute(points, enrichments);
      
      expect(segments.length).toBeGreaterThan(0);
      expect(segments.every(s => s.distance > 0)).toBe(true);
    });
  });

  describe('getTerrainTimelineSummary', () => {
    it('should summarize terrain breakdown', () => {
      const segments = [
        { index: 0, distance: 100, surface: 'gravel' as SurfaceType, gradient: 5, startPoint: {} as any, endPoint: {} as any, confidence: 'high', fallbackUsed: false },
        { index: 1, distance: 50, surface: 'dirt' as SurfaceType, gradient: 10, startPoint: {} as any, endPoint: {} as any, confidence: 'high', fallbackUsed: false },
        { index: 2, distance: 50, surface: 'rocky' as SurfaceType, gradient: 15, startPoint: {} as any, endPoint: {} as any, confidence: 'high', fallbackUsed: false },
      ];
      
      const summary = getTerrainTimelineSummary(segments);
      
      expect(summary.totalDistance).toBe(200);
      expect(summary.segmentCount).toBe(3);
      expect(summary.surfaceBreakdown.gravel).toBe(100);
      expect(summary.surfaceBreakdown.dirt).toBe(50);
      expect(summary.surfaceBreakdown.rocky).toBe(50);
    });
  });
});