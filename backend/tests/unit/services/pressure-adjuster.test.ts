import { describe, it, expect } from 'vitest';
import { calculateAdjustedPressure, calculateFullPressureResult } from '../../../src/services/pressure/pressure-adjuster.service.js';
import { TERRAIN_MODIFIERS, PSI_LIMITS } from '../../../src/utils/constants.js';

describe('Pressure Adjuster', () => {
  describe('calculateAdjustedPressure', () => {
    it('should apply terrain modifiers to baseline', () => {
      const baseline = { frontPsi: 22, rearPsi: 25 };
      const terrain = {
        rockyTerrain: true,
        wetRoots: false,
        fastFlowTrail: false,
        longGravelRide: false,
        technicalDescent: false,
      };

      const result = calculateAdjustedPressure(baseline, terrain, true);

      const expectedAdjustment = TERRAIN_MODIFIERS.ROCKY_TERRAIN + -1;
      expect(result.frontPsi).toBe(22 + expectedAdjustment);
    });

    it('should apply tubeless bonus', () => {
      const baseline = { frontPsi: 22, rearPsi: 25 };
      const terrain = {
        rockyTerrain: false,
        wetRoots: false,
        fastFlowTrail: false,
        longGravelRide: false,
        technicalDescent: false,
      };

      const tubelessResult = calculateAdjustedPressure(baseline, terrain, true);
      const tubedResult = calculateAdjustedPressure(baseline, terrain, false);

      expect(tubelessResult.frontPsi).toBe(21);
      expect(tubedResult.frontPsi).toBe(22);
    });

    it('should clamp to limits when adjustments exceed bounds', () => {
      const baseline = { frontPsi: 13, rearPsi: 16 };
      const terrain = {
        rockyTerrain: true,
        wetRoots: true,
        fastFlowTrail: false,
        longGravelRide: false,
        technicalDescent: true,
      };

      const result = calculateAdjustedPressure(baseline, terrain, true);

      expect(result.frontPsi).toBeGreaterThanOrEqual(PSI_LIMITS.MIN_FRONT);
      expect(result.rearPsi).toBeGreaterThanOrEqual(PSI_LIMITS.MIN_REAR);
    });
  });

  describe('calculateFullPressureResult', () => {
    it('should return complete pressure result', () => {
      const input = {
        riderWeight: 82,
        bikeType: 'trail',
        tireWidth: 2.4,
        tubeless: true,
        ridingStyle: 'aggressive',
      };
      const terrain = {
        rockyTerrain: true,
        wetRoots: false,
        fastFlowTrail: false,
        longGravelRide: false,
        technicalDescent: false,
      };

      const result = calculateFullPressureResult(input, terrain);

      expect(result.baseline).toBeDefined();
      expect(result.adjusted).toBeDefined();
      expect(result.isValid).toBeDefined();
      expect(result.warnings).toBeDefined();
    });
  });
});