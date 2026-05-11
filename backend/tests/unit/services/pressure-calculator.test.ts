import { describe, it, expect } from 'vitest';
import {
  calculateWeightAdjustment,
  calculateWidthAdjustment,
  calculateStyleAdjustment,
  calculateTubelessBonus,
  getBikeTypeBaseline,
  calculateBaselinePressure,
  validatePressureRange,
  clampPressureToLimits,
} from '../../../src/services/pressure/pressure-calculator.service.js';
import {
  RIDER_WEIGHT_ADJUSTMENTS,
  TIRE_WIDTH_ADJUSTMENTS,
  RIDING_STYLE_MODIFIERS,
  BIKE_TYPE_BASELINES,
  PSI_LIMITS,
} from '../../../src/utils/constants.js';

describe('Pressure Calculator', () => {
  describe('calculateWeightAdjustment', () => {
    it('should return -2 for light riders (<65kg)', () => {
      expect(calculateWeightAdjustment(50)).toBe(RIDER_WEIGHT_ADJUSTMENTS.LIGHT.adjustment);
    });

    it('should return 0 for medium riders (65-85kg)', () => {
      expect(calculateWeightAdjustment(75)).toBe(RIDER_WEIGHT_ADJUSTMENTS.MEDIUM.adjustment);
    });

    it('should return 2 for heavy riders (85-100kg)', () => {
      expect(calculateWeightAdjustment(90)).toBe(RIDER_WEIGHT_ADJUSTMENTS.HEAVY.adjustment);
    });

    it('should return 4 for very heavy riders (>100kg)', () => {
      expect(calculateWeightAdjustment(110)).toBe(RIDER_WEIGHT_ADJUSTMENTS.VERY_HEAVY.adjustment);
    });
  });

  describe('calculateWidthAdjustment', () => {
    it('should return +3 for narrow tires (<2.0)', () => {
      expect(calculateWidthAdjustment(1.8)).toBe(TIRE_WIDTH_ADJUSTMENTS.NARROW.adjustment);
    });

    it('should return 0 for medium tires (2.0-2.5)', () => {
      expect(calculateWidthAdjustment(2.3)).toBe(TIRE_WIDTH_ADJUSTMENTS.MEDIUM.adjustment);
    });

    it('should return -2 for wide tires (>2.5)', () => {
      expect(calculateWidthAdjustment(2.8)).toBe(TIRE_WIDTH_ADJUSTMENTS.WIDE.adjustment);
    });
  });

  describe('calculateStyleAdjustment', () => {
    it('should return -1 for conservative style', () => {
      expect(calculateStyleAdjustment('conservative')).toBe(RIDING_STYLE_MODIFIERS.conservative);
    });

    it('should return 0 for moderate style', () => {
      expect(calculateStyleAdjustment('moderate')).toBe(RIDING_STYLE_MODIFIERS.moderate);
    });

    it('should return 1 for aggressive style', () => {
      expect(calculateStyleAdjustment('aggressive')).toBe(RIDING_STYLE_MODIFIERS.aggressive);
    });
  });

  describe('calculateTubelessBonus', () => {
    it('should return -1 for tubeless', () => {
      expect(calculateTubelessBonus(true)).toBe(-1);
    });

    it('should return 0 for tubed', () => {
      expect(calculateTubelessBonus(false)).toBe(0);
    });
  });

  describe('getBikeTypeBaseline', () => {
    it('should return correct baseline for trail', () => {
      const baseline = getBikeTypeBaseline('trail');
      expect(baseline.frontBase).toBe(BIKE_TYPE_BASELINES.trail.frontBase);
      expect(baseline.rearBase).toBe(BIKE_TYPE_BASELINES.trail.rearBase);
    });

    it('should return correct baseline for enduro', () => {
      const baseline = getBikeTypeBaseline('enduro');
      expect(baseline.frontBase).toBe(BIKE_TYPE_BASELINES.enduro.frontBase);
    });

    it('should return trail baseline for unknown type', () => {
      const baseline = getBikeTypeBaseline('unknown');
      expect(baseline.frontBase).toBe(BIKE_TYPE_BASELINES.trail.frontBase);
    });
  });

  describe('calculateBaselinePressure', () => {
    it('should calculate correct baseline for typical rider', () => {
      const input = {
        riderWeight: 82,
        bikeType: 'trail',
        tireWidth: 2.4,
        tubeless: true,
        ridingStyle: 'aggressive',
      };

      const result = calculateBaselinePressure(input);

      const expectedFront =
        BIKE_TYPE_BASELINES.trail.frontBase +
        RIDER_WEIGHT_ADJUSTMENTS.MEDIUM.adjustment -
        TIRE_WIDTH_ADJUSTMENTS.MEDIUM.adjustment +
        RIDING_STYLE_MODIFIERS.aggressive;

      expect(result.frontPsi).toBe(expectedFront);
      expect(result.weightAdjustment).toBe(RIDER_WEIGHT_ADJUSTMENTS.MEDIUM.adjustment);
    });
  });

  describe('validatePressureRange', () => {
    it('should return valid for pressures within limits', () => {
      const result = validatePressureRange(22, 25);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should return warning for low front PSI', () => {
      const result = validatePressureRange(10, 25);

      expect(result.valid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should return warning for high rear PSI', () => {
      const result = validatePressureRange(22, 45);

      expect(result.valid).toBe(false);
    });
  });

  describe('clampPressureToLimits', () => {
    it('should clamp low pressure to minimum', () => {
      const result = clampPressureToLimits(5, 10);

      expect(result.frontPsi).toBe(PSI_LIMITS.MIN_FRONT);
      expect(result.rearPsi).toBe(PSI_LIMITS.MIN_REAR);
    });

    it('should clamp high pressure to maximum', () => {
      const result = clampPressureToLimits(40, 50);

      expect(result.frontPsi).toBe(PSI_LIMITS.MAX_FRONT);
      expect(result.rearPsi).toBe(PSI_LIMITS.MAX_REAR);
    });

    it('should not modify valid pressures', () => {
      const result = clampPressureToLimits(22, 25);

      expect(result.frontPsi).toBe(22);
      expect(result.rearPsi).toBe(25);
    });
  });
});