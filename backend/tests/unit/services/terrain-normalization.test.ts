import { describe, it, expect } from 'vitest';
import {
  calculateTerrainComposition,
  validateComposition,
  normalizeComposition,
  calculateRoughnessScore,
  calculateTechnicalityScore,
  calculateFlowScore,
  buildTerrainProfile,
  buildManualTerrainProfile,
} from '../../../src/services/terrain/terrain-normalization.service.js';
import type { TerrainTimelineSegment, TerrainComposition, TerrainProfile } from '../../../src/services/terrain/terrain.types.js';
import type { SegmentEnrichment, SurfaceType } from '../../../src/services/osm/osm.types.js';
import type { RouteMetrics } from '../../../src/types/analyze.types.js';

describe('Terrain Normalization Service', () => {
  describe('calculateTerrainComposition', () => {
    it('should calculate percentages from segments', () => {
      const segments: TerrainTimelineSegment[] = [
        { index: 0, distance: 100, surface: 'gravel', gradient: 5, startPoint: {} as any, endPoint: {} as any, confidence: 'high', fallbackUsed: false },
        { index: 1, distance: 100, surface: 'dirt', gradient: 8, startPoint: {} as any, endPoint: {} as any, confidence: 'high', fallbackUsed: false },
        { index: 2, distance: 50, surface: 'rocky', gradient: 12, startPoint: {} as any, endPoint: {} as any, confidence: 'high', fallbackUsed: false },
      ];
      
      const composition = calculateTerrainComposition(segments);
      
      expect(composition.gravel).toBeCloseTo(0.4, 2);
      expect(composition.dirt).toBeCloseTo(0.4, 2);
      expect(composition.rocky).toBeCloseTo(0.2, 2);
      expect(composition.asphalt).toBe(0);
      expect(composition.technical).toBe(0);
    });

    it('should return zeros for empty segments', () => {
      const composition = calculateTerrainComposition([]);
      
      expect(Object.values(composition).every(v => v === 0)).toBe(true);
    });
  });

  describe('validateComposition', () => {
    it('should validate composition summing to 1', () => {
      const composition: TerrainComposition = {
        asphalt: 0.1,
        gravel: 0.4,
        dirt: 0.2,
        rocky: 0.2,
        technical: 0.1,
      };
      
      expect(validateComposition(composition)).toBe(true);
    });

    it('should reject composition not summing to 1', () => {
      const composition: TerrainComposition = {
        asphalt: 0.1,
        gravel: 0.4,
        dirt: 0.2,
        rocky: 0.1,
        technical: 0.1,
      };
      
      expect(validateComposition(composition)).toBe(false);
    });
  });

  describe('normalizeComposition', () => {
    it('should normalize composition to sum to 1', () => {
      const composition: TerrainComposition = {
        asphalt: 0,
        gravel: 0.4,
        dirt: 0.2,
        rocky: 0,
        technical: 0,
      };
      
      const normalized = normalizeComposition(composition);
      
      const sum = Object.values(normalized).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 5);
    });

    it('should return dirt default for zero composition', () => {
      const composition: TerrainComposition = {
        asphalt: 0,
        gravel: 0,
        dirt: 0,
        rocky: 0,
        technical: 0,
      };
      
      const normalized = normalizeComposition(composition);
      
      expect(normalized.dirt).toBe(1);
    });
  });

  describe('calculateRoughnessScore', () => {
    it('should return higher roughness for rocky terrain', () => {
      const segments: TerrainTimelineSegment[] = [
        { index: 0, distance: 100, surface: 'rocky', gradient: 5, startPoint: {} as any, endPoint: {} as any, confidence: 'high', fallbackUsed: false },
      ];
      const enrichments: SegmentEnrichment[] = [
        { segmentIndex: 0, classifiedSurface: 'rocky', osmTags: {}, confidence: 'high', fallbackUsed: false } as any,
      ];
      
      const score = calculateRoughnessScore(segments, enrichments);
      
      expect(score).toBeCloseTo(0.8, 1);
    });

    it('should return lower roughness for asphalt', () => {
      const segments: TerrainTimelineSegment[] = [
        { index: 0, distance: 100, surface: 'asphalt', gradient: 0, startPoint: {} as any, endPoint: {} as any, confidence: 'high', fallbackUsed: false },
      ];
      const enrichments: SegmentEnrichment[] = [
        { segmentIndex: 0, classifiedSurface: 'asphalt', osmTags: {}, confidence: 'high', fallbackUsed: false } as any,
      ];
      
      const score = calculateRoughnessScore(segments, enrichments);
      
      expect(score).toBeCloseTo(0.1, 1);
    });
  });

  describe('calculateTechnicalityScore', () => {
    it('should return high score for technical terrain', () => {
      const segments: TerrainTimelineSegment[] = [
        { index: 0, distance: 100, surface: 'technical', gradient: 15, startPoint: {} as any, endPoint: {} as any, confidence: 'high', fallbackUsed: false },
        { index: 1, distance: 100, surface: 'rocky', gradient: 20, startPoint: {} as any, endPoint: {} as any, confidence: 'high', fallbackUsed: false },
      ];
      const routeMetrics: RouteMetrics = {
        totalDistance: 2,
        elevationGain: 500,
        elevationLoss: 300,
        maxGradient: 25,
        avgGradient: 15,
        difficultyRating: 'expert',
      };
      
      const score = calculateTechnicalityScore(segments, routeMetrics);
      
      expect(score).toBeGreaterThan(0.5);
    });
  });

  describe('calculateFlowScore', () => {
    it('should return high score for smooth terrain', () => {
      const segments: TerrainTimelineSegment[] = [
        { index: 0, distance: 100, surface: 'asphalt', gradient: 2, startPoint: {} as any, endPoint: {} as any, confidence: 'high', fallbackUsed: false },
        { index: 1, distance: 100, surface: 'asphalt', gradient: 2, startPoint: {} as any, endPoint: {} as any, confidence: 'high', fallbackUsed: false },
      ];
      const routeMetrics: RouteMetrics = {
        totalDistance: 2,
        elevationGain: 50,
        elevationLoss: 40,
        maxGradient: 3,
        avgGradient: 2,
        difficultyRating: 'easy',
      };
      
      const score = calculateFlowScore(segments, routeMetrics);
      
      expect(score).toBeGreaterThan(0.5);
    });
  });

  describe('buildManualTerrainProfile', () => {
    it('should create profile from manual input', () => {
      const profile = buildManualTerrainProfile({
        asphalt: 0.2,
        gravel: 0.5,
        dirt: 0.3,
      });
      
      expect(profile.composition.asphalt).toBeCloseTo(0.2, 2);
      expect(profile.composition.gravel).toBeCloseTo(0.5, 2);
      expect(profile.composition.dirt).toBeCloseTo(0.3, 2);
      expect(profile.scores.roughness).toBeGreaterThan(0);
      expect(profile.osmEnrichmentStatus?.osmAvailable).toBe(false);
      expect(profile.osmEnrichmentStatus?.fallbackMode).toBe('manual');
    });

    it('should normalize manual input', () => {
      const profile = buildManualTerrainProfile({
        gravel: 1,
        rocky: 1,
      });
      
      const sum = Object.values(profile.composition).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 5);
    });
  });
});