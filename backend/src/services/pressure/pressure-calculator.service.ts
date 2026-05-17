import logger from '../../utils/logger.js';
import {
  BIKE_TYPE_BASELINES,
  RIDER_WEIGHT_ADJUSTMENTS,
  TIRE_WIDTH_ADJUSTMENTS,
  RIDING_STYLE_MODIFIERS,
  SKILL_LEVEL_MODIFIERS,
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

export function calculateSkillAdjustment(skillLevel: string): number {
  return SKILL_LEVEL_MODIFIERS[skillLevel as keyof typeof SKILL_LEVEL_MODIFIERS] ?? 0;
}

export function calculateTubelessBonus(tubeless: boolean): number {
  return tubeless ? -1 : 0;
}

export function getBikeTypeBaseline(bikeType: string): { frontBase: number; rearBase: number } {
  return BIKE_TYPE_BASELINES[bikeType as keyof typeof BIKE_TYPE_BASELINES] ?? BIKE_TYPE_BASELINES.trail;
}

export function calculateBaselinePressure(input: PressureInput): BaselinePressure {
  logger.substep('Baseline Pressure Calculation', {
    input: {
      riderWeight: input.riderWeight,
      bikeType: input.bikeType,
      tireWidth: input.tireWidth,
      ridingStyle: input.ridingStyle,
      skillLevel: input.skillLevel,
      tubeless: input.tubeless,
    },
  });
  
  const bikeBaseline = getBikeTypeBaseline(input.bikeType);
  logger.debug('Bike Baseline', {
    bikeType: input.bikeType,
    frontBase: bikeBaseline.frontBase,
    rearBase: bikeBaseline.rearBase,
  });
  
  const weightAdjustment = calculateWeightAdjustment(input.riderWeight);
  logger.debug('Weight Adjustment', {
    riderWeight: input.riderWeight,
    adjustment: weightAdjustment,
    category: input.riderWeight < RIDER_WEIGHT_ADJUSTMENTS.LIGHT.max ? 'LIGHT'
      : input.riderWeight < RIDER_WEIGHT_ADJUSTMENTS.MEDIUM.max ? 'MEDIUM'
      : input.riderWeight < RIDER_WEIGHT_ADJUSTMENTS.HEAVY.max ? 'HEAVY'
      : 'VERY_HEAVY',
  });
  
  const widthAdjustment = calculateWidthAdjustment(input.tireWidth);
  logger.debug('Width Adjustment', {
    tireWidth: input.tireWidth,
    adjustment: widthAdjustment,
    category: input.tireWidth < TIRE_WIDTH_ADJUSTMENTS.NARROW.max ? 'NARROW'
      : input.tireWidth < TIRE_WIDTH_ADJUSTMENTS.MEDIUM.max ? 'MEDIUM'
      : 'WIDE',
  });
  
  const styleAdjustment = calculateStyleAdjustment(input.ridingStyle);
  logger.debug('Style Adjustment', {
    ridingStyle: input.ridingStyle,
    adjustment: styleAdjustment,
  });

  const skillAdjustment = calculateSkillAdjustment(input.skillLevel);
  logger.debug('Skill Adjustment', {
    skillLevel: input.skillLevel,
    adjustment: skillAdjustment,
  });

  const frontPsi = bikeBaseline.frontBase + weightAdjustment - widthAdjustment + styleAdjustment + skillAdjustment;
  const rearPsi = bikeBaseline.rearBase + weightAdjustment - widthAdjustment + styleAdjustment + skillAdjustment;

  const result = {
    frontPsi,
    rearPsi,
    weightAdjustment,
    widthAdjustment,
    styleAdjustment,
    skillAdjustment,
  };
  
  logger.success('Baseline Pressure Result', {
    frontPsi,
    rearPsi,
    breakdown: {
      frontBase: bikeBaseline.frontBase,
      rearBase: bikeBaseline.rearBase,
      weightAdjustment,
      widthAdjustment: '-' + Math.abs(widthAdjustment),
      styleAdjustment,
      skillAdjustment,
    },
  });

  return result;
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
    frontPsi: Math.round(Math.max(PSI_LIMITS.MIN_FRONT, Math.min(PSI_LIMITS.MAX_FRONT, frontPsi))),
    rearPsi: Math.round(Math.max(PSI_LIMITS.MIN_REAR, Math.min(PSI_LIMITS.MAX_REAR, rearPsi))),
  };
}

export function calculateTerrainBasedAdjustment(
  composition: TerrainComposition
): {
  frontAdjustment: number;
  rearAdjustment: number;
  appliedWeights: { surface: string; weight: number; modifier: number; contribution: number }[];
} {
  logger.substep('Terrain-Based Adjustment Calculation', {
    composition: {
      asphalt: Math.round(composition.asphalt * 100) + '%',
      gravel: Math.round(composition.gravel * 100) + '%',
      dirt: Math.round(composition.dirt * 100) + '%',
      rocky: Math.round(composition.rocky * 100) + '%',
      technical: Math.round(composition.technical * 100) + '%',
    },
  });
  
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
      
      logger.debug('Surface Contribution', {
        surface,
        percentage: Math.round(percentage * 100) + '%',
        modifier,
        contribution: Math.round(contribution * 100) / 100 + ' psi',
        formula: `${Math.round(percentage * 100)}% × ${modifier} = ${Math.round(contribution * 100) / 100}`,
      });
    }
  }
  
  const result = {
    frontAdjustment: totalAdjustment,
    rearAdjustment: totalAdjustment,
    appliedWeights,
  };
  
  logger.success('Terrain Adjustment Result', {
    totalAdjustment: Math.round(totalAdjustment * 100) / 100 + ' psi',
    appliedWeights: appliedWeights.map(w => ({
      surface: w.surface,
      weight: Math.round(w.weight * 100) + '%',
      modifier: w.modifier,
      contribution: Math.round(w.contribution * 100) / 100 + ' psi',
    })),
  });
  
  return result;
}