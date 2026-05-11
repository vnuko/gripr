import {
  BIKE_TYPE_BASELINES,
  RIDER_WEIGHT_ADJUSTMENTS,
  TIRE_WIDTH_ADJUSTMENTS,
  RIDING_STYLE_MODIFIERS,
  PSI_LIMITS,
  SURFACE_TYPE_MODIFIERS,
} from '../../utils/constants.js';
import type { PressureInput, BaselinePressure } from './pressure.types.js';
import type { TerrainComposition } from '../terrain/terrain.types.js';

export function calculateWeightAdjustment(weight: number): number {
  if (weight < RIDER_WEIGHT_ADJUSTMENTS.LIGHT.max) {
    return RIDER_WEIGHT_ADJUSTMENTS.LIGHT.adjustment;
  }
  if (weight < RIDER_WEIGHT_ADJUSTMENTS.MEDIUM.max) {
    return RIDER_WEIGHT_ADJUSTMENTS.MEDIUM.adjustment;
  }
  if (weight < RIDER_WEIGHT_ADJUSTMENTS.HEAVY.max) {
    return RIDER_WEIGHT_ADJUSTMENTS.HEAVY.adjustment;
  }
  return RIDER_WEIGHT_ADJUSTMENTS.VERY_HEAVY.adjustment;
}

export function calculateWidthAdjustment(width: number): number {
  if (width < TIRE_WIDTH_ADJUSTMENTS.NARROW.max) {
    return TIRE_WIDTH_ADJUSTMENTS.NARROW.adjustment;
  }
  if (width < TIRE_WIDTH_ADJUSTMENTS.MEDIUM.max) {
    return TIRE_WIDTH_ADJUSTMENTS.MEDIUM.adjustment;
  }
  return TIRE_WIDTH_ADJUSTMENTS.WIDE.adjustment;
}

export function calculateStyleAdjustment(style: string): number {
  return RIDING_STYLE_MODIFIERS[style as keyof typeof RIDING_STYLE_MODIFIERS] ?? 0;
}

export function calculateTubelessBonus(tubeless: boolean): number {
  return tubeless ? -1 : 0;
}

export function getBikeTypeBaseline(bikeType: string): { frontBase: number; rearBase: number } {
  return BIKE_TYPE_BASELINES[bikeType as keyof typeof BIKE_TYPE_BASELINES] ?? BIKE_TYPE_BASELINES.trail;
}

export function calculateBaselinePressure(input: PressureInput): BaselinePressure {
  const bikeBaseline = getBikeTypeBaseline(input.bikeType);
  const weightAdjustment = calculateWeightAdjustment(input.riderWeight);
  const widthAdjustment = calculateWidthAdjustment(input.tireWidth);
  const styleAdjustment = calculateStyleAdjustment(input.ridingStyle);

  const frontPsi = bikeBaseline.frontBase + weightAdjustment - widthAdjustment + styleAdjustment;
  const rearPsi = bikeBaseline.rearBase + weightAdjustment - widthAdjustment + styleAdjustment;

  return {
    frontPsi,
    rearPsi,
    weightAdjustment,
    widthAdjustment,
    styleAdjustment,
  };
}

export function validatePressureRange(frontPsi: number, rearPsi: number): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (frontPsi < PSI_LIMITS.MIN_FRONT) {
    warnings.push(`Front PSI (${frontPsi}) is below minimum (${PSI_LIMITS.MIN_FRONT})`);
  }
  if (frontPsi > PSI_LIMITS.MAX_FRONT) {
    warnings.push(`Front PSI (${frontPsi}) is above maximum (${PSI_LIMITS.MAX_FRONT})`);
  }
  if (rearPsi < PSI_LIMITS.MIN_REAR) {
    warnings.push(`Rear PSI (${rearPsi}) is below minimum (${PSI_LIMITS.MIN_REAR})`);
  }
  if (rearPsi > PSI_LIMITS.MAX_REAR) {
    warnings.push(`Rear PSI (${rearPsi}) is above maximum (${PSI_LIMITS.MAX_REAR})`);
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

export function clampPressureToLimits(frontPsi: number, rearPsi: number): { frontPsi: number; rearPsi: number } {
  return {
    frontPsi: Math.max(PSI_LIMITS.MIN_FRONT, Math.min(PSI_LIMITS.MAX_FRONT, frontPsi)),
    rearPsi: Math.max(PSI_LIMITS.MIN_REAR, Math.min(PSI_LIMITS.MAX_REAR, rearPsi)),
  };
}

export function calculateTerrainBasedAdjustment(
  composition: TerrainComposition
): {
  frontAdjustment: number;
  rearAdjustment: number;
  appliedWeights: { surface: string; weight: number; modifier: number; contribution: number }[];
} {
  const appliedWeights: { surface: string; weight: number; modifier: number; contribution: number }[] = [];
  
  let totalAdjustment = 0;
  
  for (const [surface, percentage] of Object.entries(composition)) {
    if (percentage > 0) {
      const modifier = SURFACE_TYPE_MODIFIERS[surface as keyof TerrainComposition] ?? 0;
      const contribution = percentage * modifier;
      
      totalAdjustment += contribution;
      
      appliedWeights.push({
        surface,
        weight: percentage,
        modifier,
        contribution,
      });
    }
  }
  
  return {
    frontAdjustment: totalAdjustment,
    rearAdjustment: totalAdjustment,
    appliedWeights,
  };
}