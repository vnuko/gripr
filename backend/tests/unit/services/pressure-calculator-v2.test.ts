import { describe, it, expect } from 'vitest';
import { calculateTerrainBasedAdjustment } from '../../../src/services/pressure/pressure-calculator.service.js';
import { calculateAdjustedPressureV2, calculateFullPressureResultV2 } from '../../../src/services/pressure/pressure-adjuster.service.js';
import { SURFACE_TYPE_MODIFIERS } from '../../../src/utils/constants.js';
import type { TerrainComposition, TerrainProfile } from '../../../src/services/terrain/terrain.types.js';
import type { PressureInput } from '../../../src/services/pressure/pressure.types.js';

describe('Pressure Calculator V2', () => {
  describe('calculateTerrainBasedAdjustment', () => {
    it('should calculate weighted adjustment for mixed terrain', () => {
      const composition: TerrainComposition = {
        asphalt: 0.1,
        gravel: 0.4,
        dirt: 0.2,
        rocky: 0.2,
        technical: 0.1,
      };
      
      const result = calculateTerrainBasedAdjustment(composition);
      
      expect(result.frontAdjustment).toBeCloseTo(-0.4, 2);
      expect(result.appliedWeights.length).toBe(5);
    });

    it('should return positive for pure asphalt', () => {
      const composition: TerrainComposition = {
        asphalt: 1,
        gravel: 0,
        dirt: 0,
        rocky: 0,
        technical: 0,
      };
      
      const result = calculateTerrainBasedAdjustment(composition);
      
      expect(result.frontAdjustment).toBeCloseTo(SURFACE_TYPE_MODIFIERS.asphalt, 2);
    });

    it('should return negative for pure rocky', () => {
      const composition: TerrainComposition = {
        asphalt: 0,
        gravel: 0,
        dirt: 0,
        rocky: 1,
        technical: 0,
      };
      
      const result = calculateTerrainBasedAdjustment(composition);
      
      expect(result.frontAdjustment).toBeCloseTo(SURFACE_TYPE_MODIFIERS.rocky, 2);
    });

    it('should track applied weights correctly', () => {
      const composition: TerrainComposition = {
        asphalt: 0,
        gravel: 0.5,
        dirt: 0.5,
        rocky: 0,
        technical: 0,
      };
      
      const result = calculateTerrainBasedAdjustment(composition);
      
      expect(result.appliedWeights.find(w => w.surface === 'gravel')).toBeDefined();
      expect(result.appliedWeights.find(w => w.surface === 'dirt')).toBeDefined();
      
      const gravelWeight = result.appliedWeights.find(w => w.surface === 'gravel');
      expect(gravelWeight?.contribution).toBeCloseTo(0.5 * SURFACE_TYPE_MODIFIERS.gravel, 2);
    });
  });

  describe('calculateAdjustedPressureV2', () => {
    it('should apply terrain composition to baseline', () => {
      const baseline = { frontPsi: 22, rearPsi: 25 };
      const terrainProfile: TerrainProfile = {
        composition: {
          asphalt: 0,
          gravel: 1,
          dirt: 0,
          rocky: 0,
          technical: 0,
        },
        scores: { roughness: 0.4, technicality: 0, flow: 0.5 },
      };
      
      const result = calculateAdjustedPressureV2(baseline, terrainProfile, true);
      
      expect(result.frontPsi).toBe(Math.round(22 + 0.5 - 1));
      expect(result.terrainBased.appliedWeights.length).toBe(1);
    });

    it('should clamp to limits', () => {
      const baseline = { frontPsi: 13, rearPsi: 16 };
      const terrainProfile: TerrainProfile = {
        composition: {
          asphalt: 0,
          gravel: 0,
          dirt: 0,
          rocky: 1,
          technical: 0,
        },
        scores: { roughness: 0.8, technicality: 0.5, flow: 0.1 },
      };
      
      const result = calculateAdjustedPressureV2(baseline, terrainProfile, true);
      
      expect(result.frontPsi).toBeGreaterThanOrEqual(12);
    });
  });

  describe('calculateFullPressureResultV2', () => {
    it('should return complete result with terrain profile', () => {
      const input: PressureInput = {
        riderWeight: 82,
        bikeType: 'trail',
        tireWidth: 2.4,
        tubeless: true,
        ridingStyle: 'aggressive',
      };
      
      const terrainProfile: TerrainProfile = {
        composition: {
          asphalt: 0.1,
          gravel: 0.4,
          dirt: 0.3,
          rocky: 0.1,
          technical: 0.1,
        },
        scores: { roughness: 0.5, technicality: 0.3, flow: 0.4 },
      };
      
      const result = calculateFullPressureResultV2(input, terrainProfile);
      
      expect(result.baseline).toBeDefined();
      expect(result.adjusted).toBeDefined();
      expect(result.terrainBased).toBeDefined();
      expect(result.terrainProfile).toBeDefined();
      expect(result.isValid).toBeDefined();
    });
  });
});