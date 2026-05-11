import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateDistanceMeters,
  distanceToSegment,
  findNearestWay,
  determineConfidence,
  matchPointsToWays,
  isMatchSufficient,
} from '../../../src/services/osm/map-matching.service.js';
import { MATCHING_CONFIG } from '../../../src/utils/constants.js';
import type { OsmWay, ParsedTrackPoint } from '../../../src/services/osm/osm.types.js';
import { createMockOsmWay } from '../../mocks/osm-response.mock.js';

describe('Map Matching Service', () => {
  describe('calculateDistanceMeters', () => {
    it('should calculate distance between two points', () => {
      const distance = calculateDistanceMeters(47.3769, 8.5417, 47.3770, 8.5418);
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(20);
    });

    it('should return 0 for same point', () => {
      const distance = calculateDistanceMeters(47.3769, 8.5417, 47.3769, 8.5417);
      
      expect(distance).toBe(0);
    });
  });

  describe('distanceToSegment', () => {
    it('should calculate distance to line segment', () => {
      const distance = distanceToSegment(
        47.3770, 8.5418,
        47.3769, 8.5417,
        47.3771, 8.5419
      );
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(50);
    });

    it('should return 0 when point is on segment', () => {
      const distance = distanceToSegment(
        47.3770, 8.5418,
        47.3769, 8.5417,
        47.3771, 8.5419
      );
      
      expect(distance).toBeCloseTo(0, 1);
    });
  });

  describe('findNearestWay', () => {
    it('should find nearest way for close point', () => {
      const point = { lat: 47.3769, lon: 8.5417 };
      const ways: OsmWay[] = [
        createMockOsmWay(1, { highway: 'track', surface: 'gravel' }, [
          { lat: 47.3769, lon: 8.5417 },
          { lat: 47.3770, lon: 8.5418 },
        ]),
        createMockOsmWay(2, { highway: 'path' }, [
          { lat: 48.0, lon: 9.0 },
          { lat: 48.1, lon: 9.1 },
        ]),
      ];
      
      const result = findNearestWay(point, ways);
      
      expect(result).not.toBeNull();
      expect(result?.way.id).toBe(1);
      expect(result?.distance).toBeLessThan(MATCHING_CONFIG.MAX_SNAP_DISTANCE_M);
    });

    it('should return null when no way is close enough', () => {
      const point = { lat: 47.3769, lon: 8.5417 };
      const ways: OsmWay[] = [
        createMockOsmWay(1, { highway: 'track' }, [
          { lat: 50.0, lon: 10.0 },
          { lat: 50.1, lon: 10.1 },
        ]),
      ];
      
      const result = findNearestWay(point, ways);
      
      expect(result).toBeNull();
    });

    it('should handle empty ways array', () => {
      const point = { lat: 47.3769, lon: 8.5417 };
      
      const result = findNearestWay(point, []);
      
      expect(result).toBeNull();
    });
  });

  describe('determineConfidence', () => {
    it('should return high for very close match', () => {
      expect(determineConfidence(5)).toBe('high');
    });

    it('should return medium for moderate distance', () => {
      expect(determineConfidence(15)).toBe('medium');
    });

    it('should return low for distant match', () => {
      expect(determineConfidence(25)).toBe('low');
    });
  });

  describe('matchPointsToWays', () => {
    it('should match points to ways correctly', () => {
      const points: ParsedTrackPoint[] = [
        { latitude: 47.3769, longitude: 8.5417, elevation: 450, timestamp: null },
        { latitude: 47.3770, longitude: 8.5418, elevation: 455, timestamp: null },
      ];
      
      const ways: OsmWay[] = [
        {
          id: 1,
          type: 'way',
          nodes: [1, 2, 3],
          tags: { highway: 'track', surface: 'gravel' },
          geometry: [
            { lat: 47.3769, lon: 8.5417 },
            { lat: 47.3770, lon: 8.5418 },
          ],
        },
      ];
      
      const result = matchPointsToWays(points, ways);
      
      expect(result.matchedSegments.length).toBe(2);
      expect(result.unmatchedPoints.length).toBe(0);
      expect(result.matchRate).toBeCloseTo(1, 2);
    });

    it('should track unmatched points', () => {
      const points: ParsedTrackPoint[] = [
        { latitude: 47.3769, longitude: 8.5417, elevation: 450, timestamp: null },
        { latitude: 50.0, longitude: 10.0, elevation: 450, timestamp: null },
      ];
      
      const ways: OsmWay[] = [
        {
          id: 1,
          type: 'way',
          nodes: [1, 2],
          tags: { highway: 'track' },
          geometry: [
            { lat: 47.3769, lon: 8.5417 },
            { lat: 47.3770, lon: 8.5418 },
          ],
        },
      ];
      
      const result = matchPointsToWays(points, ways);
      
      expect(result.matchedSegments.length).toBe(1);
      expect(result.unmatchedPoints.length).toBe(1);
      expect(result.matchRate).toBeCloseTo(0.5, 2);
    });
  });

  describe('isMatchSufficient', () => {
    it('should return true for high match rate', () => {
      const result = {
        matchedSegments: [],
        unmatchedPoints: [],
        matchRate: 0.8,
      };
      
      expect(isMatchSufficient(result)).toBe(true);
    });

    it('should return false for low match rate', () => {
      const result = {
        matchedSegments: [],
        unmatchedPoints: [],
        matchRate: 0.3,
      };
      
      expect(isMatchSufficient(result)).toBe(false);
    });
  });
});