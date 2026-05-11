import { describe, it, expect } from 'vitest';
import { parseGpxContent } from '../../../src/services/gpx/gpx-parser.service.js';
import {
  calculateDistanceBetweenPoints,
  calculateTotalDistance,
  calculateElevationGainLoss,
  calculateMaxGradient,
  calculateAverageGradient,
  determineDifficultyRating,
  analyzeRoute,
} from '../../../src/services/gpx/gpx-analyzer.service.js';

describe('GPX Analyzer Service', () => {
  describe('calculateDistanceBetweenPoints', () => {
    it('should calculate distance between two points', () => {
      const p1 = { latitude: 47.3769, longitude: 8.5417, elevation: 450, timestamp: null };
      const p2 = { latitude: 47.3770, longitude: 8.5418, elevation: 455, timestamp: null };

      const distance = calculateDistanceBetweenPoints(p1, p2);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1);
    });

    it('should return 0 for same point', () => {
      const p = { latitude: 47.3769, longitude: 8.5417, elevation: 450, timestamp: null };

      const distance = calculateDistanceBetweenPoints(p, p);

      expect(distance).toBe(0);
    });
  });

  describe('calculateTotalDistance', () => {
    it('should sum all segment distances', () => {
      const points = [
        { latitude: 47.3769, longitude: 8.5417, elevation: 450, timestamp: null },
        { latitude: 47.3770, longitude: 8.5418, elevation: 455, timestamp: null },
        { latitude: 47.3771, longitude: 8.5419, elevation: 460, timestamp: null },
      ];

      const result = calculateTotalDistance(points);

      expect(result.totalDistance).toBeGreaterThan(0);
      expect(result.segmentDistances).toHaveLength(2);
    });

    it('should return 0 for single point', () => {
      const points = [{ latitude: 47.0, longitude: 8.0, elevation: 100, timestamp: null }];

      const result = calculateTotalDistance(points);

      expect(result.totalDistance).toBe(0);
      expect(result.segmentDistances).toHaveLength(0);
    });
  });

  describe('calculateElevationGainLoss', () => {
    it('should calculate gain and loss', () => {
      const points = [
        { latitude: 47.0, longitude: 8.0, elevation: 100, timestamp: null },
        { latitude: 47.1, longitude: 8.1, elevation: 150, timestamp: null },
        { latitude: 47.2, longitude: 8.2, elevation: 120, timestamp: null },
      ];

      const result = calculateElevationGainLoss(points);

      expect(result.elevationGain).toBe(50);
      expect(result.elevationLoss).toBe(30);
    });
  });

  describe('determineDifficultyRating', () => {
    it('should return easy for short flat route', () => {
      const rating = determineDifficultyRating(5, 50, 2);

      expect(rating).toBe('easy');
    });

    it('should return expert for long steep route', () => {
      const rating = determineDifficultyRating(60, 2000, 30);

      expect(rating).toBe('expert');
    });

    it('should return moderate for medium route', () => {
      const rating = determineDifficultyRating(20, 500, 8);

      expect(rating).toBe('moderate');
    });
  });

  describe('analyzeRoute', () => {
    it('should return full metrics for valid GPX', () => {
      const gpxContent = `<?xml version="1.0"?>
        <gpx version="1.1">
          <trk>
            <trkseg>
              <trkpt lat="47.3769" lon="8.5417"><ele>450</ele></trkpt>
              <trkpt lat="47.3770" lon="8.5418"><ele>455</ele></trkpt>
              <trkpt lat="47.3771" lon="8.5419"><ele>460</ele></trkpt>
              <trkpt lat="47.3772" lon="8.5420"><ele>455</ele></trkpt>
            </trkseg>
          </trk>
        </gpx>`;

      const parsed = parseGpxContent(gpxContent);
      const metrics = analyzeRoute(parsed);

      expect(metrics.totalDistance).toBeGreaterThan(0);
      expect(metrics.elevationGain).toBe(10);
      expect(metrics.elevationLoss).toBe(5);
      expect(metrics.difficultyRating).toBeDefined();
    });

    it('should return zeros for empty GPX', () => {
      const gpxContent = `<?xml version="1.0"?><gpx version="1.1"></gpx>`;

      const parsed = parseGpxContent(gpxContent);
      const metrics = analyzeRoute(parsed);

      expect(metrics.totalDistance).toBe(0);
      expect(metrics.elevationGain).toBe(0);
      expect(metrics.elevationLoss).toBe(0);
      expect(metrics.maxGradient).toBe(0);
      expect(metrics.avgGradient).toBe(0);
      expect(metrics.difficultyRating).toBe('easy');
    });
  });
});