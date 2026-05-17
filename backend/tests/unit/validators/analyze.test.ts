import { describe, it, expect } from 'vitest';
import { validateRiderInput } from '../../../src/validators/analyze.validator.js';

describe('Analyze Validator', () => {
  describe('validateRiderInput', () => {
    it('should accept valid input', () => {
      const result = validateRiderInput({
        riderWeight: 82,
        bikeType: 'trail',
        tireWidth: 2.4,
        tubeless: true,
        ridingStyle: 'aggressive',
        skillLevel: 'intermediate',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.riderWeight).toBe(82);
        expect(result.data.bikeType).toBe('trail');
        expect(result.data.tireWidth).toBe(2.4);
        expect(result.data.tubeless).toBe(true);
        expect(result.data.ridingStyle).toBe('aggressive');
        expect(result.data.skillLevel).toBe('intermediate');
      }
    });

    it('should coerce string numbers to numbers', () => {
      const result = validateRiderInput({
        riderWeight: '82',
        bikeType: 'trail',
        tireWidth: '2.4',
        tubeless: 'true',
        ridingStyle: 'aggressive',
        skillLevel: 'intermediate',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.riderWeight).toBe('number');
        expect(result.data.riderWeight).toBe(82);
      }
    });

    it('should reject rider weight below minimum', () => {
      const result = validateRiderInput({
        riderWeight: 30,
        bikeType: 'trail',
        tireWidth: 2.4,
        tubeless: true,
        ridingStyle: 'aggressive',
        skillLevel: 'intermediate',
      });

      expect(result.success).toBe(false);
    });

    it('should reject rider weight above maximum', () => {
      const result = validateRiderInput({
        riderWeight: 200,
        bikeType: 'trail',
        tireWidth: 2.4,
        tubeless: true,
        ridingStyle: 'aggressive',
        skillLevel: 'intermediate',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid bike type', () => {
      const result = validateRiderInput({
        riderWeight: 82,
        bikeType: 'invalid',
        tireWidth: 2.4,
        tubeless: true,
        ridingStyle: 'aggressive',
        skillLevel: 'intermediate',
      });

      expect(result.success).toBe(false);
    });

    it('should reject tire width below minimum', () => {
      const result = validateRiderInput({
        riderWeight: 82,
        bikeType: 'trail',
        tireWidth: 1.0,
        tubeless: true,
        ridingStyle: 'aggressive',
        skillLevel: 'intermediate',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid riding style', () => {
      const result = validateRiderInput({
        riderWeight: 82,
        bikeType: 'trail',
        tireWidth: 2.4,
        tubeless: true,
        ridingStyle: 'invalid',
        skillLevel: 'intermediate',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid skill level', () => {
      const result = validateRiderInput({
        riderWeight: 82,
        bikeType: 'trail',
        tireWidth: 2.4,
        tubeless: true,
        ridingStyle: 'aggressive',
        skillLevel: 'invalid',
      });

      expect(result.success).toBe(false);
    });
  });
});