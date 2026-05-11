import { describe, it, expect } from 'vitest';
import {
  applyTerrainModifiers,
  calculateAdjustedPsi,
} from '../../../src/services/terrain/terrain-modifiers.service.js';
import { TERRAIN_MODIFIERS } from '../../../src/utils/constants.js';

describe('Terrain Modifiers', () => {
  describe('applyTerrainModifiers', () => {
    it('should apply no modifiers when all flags false', () => {
      const result = applyTerrainModifiers(
        {
          rockyTerrain: false,
          wetRoots: false,
          fastFlowTrail: false,
          longGravelRide: false,
          technicalDescent: false,
        },
        22,
        25
      );

      expect(result.frontPsiAdjustment).toBe(0);
      expect(result.rearPsiAdjustment).toBe(0);
      expect(result.appliedModifiers).toHaveLength(0);
    });

    it('should apply rocky terrain modifier (-2 PSI)', () => {
      const result = applyTerrainModifiers(
        { rockyTerrain: true, wetRoots: false, fastFlowTrail: false, longGravelRide: false, technicalDescent: false },
        22,
        25
      );

      expect(result.frontPsiAdjustment).toBe(TERRAIN_MODIFIERS.ROCKY_TERRAIN);
      expect(result.appliedModifiers).toContainEqual({
        condition: 'Rocky terrain',
        adjustment: TERRAIN_MODIFIERS.ROCKY_TERRAIN,
      });
    });

    it('should accumulate multiple modifiers', () => {
      const result = applyTerrainModifiers(
        { rockyTerrain: true, wetRoots: true, fastFlowTrail: false, longGravelRide: false, technicalDescent: true },
        22,
        25
      );

      const expectedAdjustment = TERRAIN_MODIFIERS.ROCKY_TERRAIN +
        TERRAIN_MODIFIERS.WET_ROOTS +
        TERRAIN_MODIFIERS.TECHNICAL_DESCENT;

      expect(result.frontPsiAdjustment).toBe(expectedAdjustment);
      expect(result.appliedModifiers).toHaveLength(3);
    });
  });

  describe('calculateAdjustedPsi', () => {
    it('should calculate adjusted PSI values', () => {
      const modifiers = {
        frontPsiAdjustment: -3,
        rearPsiAdjustment: -3,
        appliedModifiers: [],
      };

      const result = calculateAdjustedPsi(22, 25, modifiers);

      expect(result.frontPsi).toBe(19);
      expect(result.rearPsi).toBe(22);
    });
  });
});