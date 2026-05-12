import type { TerrainProfile } from '../terrain/terrain.types.js';
import type { PressureInput, AdjustedPressure, PressureResultV2, TerrainBasedAdjustment } from './pressure.types.js';
import {
  calculateBaselinePressure,
  validatePressureRange,
  clampPressureToLimits,
  calculateTubelessBonus,
  calculateTerrainBasedAdjustment,
} from './pressure-calculator.service.js';

export function calculateAdjustedPressureV2(
  baseline: { frontPsi: number; rearPsi: number },
  terrainProfile: TerrainProfile,
  tubeless: boolean
): AdjustedPressure & { terrainBased: TerrainBasedAdjustment } {
  const terrainAdjustment = calculateTerrainBasedAdjustment(terrainProfile.composition);
  const tubelessBonus = calculateTubelessBonus(tubeless);
  
  const rawFrontPsi = baseline.frontPsi + terrainAdjustment.frontAdjustment + tubelessBonus;
  const rawRearPsi = baseline.rearPsi + terrainAdjustment.rearAdjustment + tubelessBonus;
  
  const clamped = clampPressureToLimits(rawFrontPsi, rawRearPsi);
  
  return {
    frontPsi: clamped.frontPsi,
    rearPsi: clamped.rearPsi,
    terrainAdjustment: terrainAdjustment.frontAdjustment,
    tubelessBonus,
    totalAdjustment: terrainAdjustment.frontAdjustment + tubelessBonus,
    terrainBased: {
      frontPsiAdjustment: terrainAdjustment.frontAdjustment,
      rearPsiAdjustment: terrainAdjustment.rearAdjustment,
      composition: terrainProfile.composition,
      appliedWeights: terrainAdjustment.appliedWeights,
    },
  };
}

export function calculateFullPressureResultV2(
  input: PressureInput,
  terrainProfile: TerrainProfile
): PressureResultV2 {
  const baseline = calculateBaselinePressure(input);
  const adjusted = calculateAdjustedPressureV2(
    { frontPsi: baseline.frontPsi, rearPsi: baseline.rearPsi },
    terrainProfile,
    input.tubeless
  );
  
  const validation = validatePressureRange(adjusted.frontPsi, adjusted.rearPsi);
  
  return {
    baseline,
    adjusted: {
      frontPsi: adjusted.frontPsi,
      rearPsi: adjusted.rearPsi,
      terrainAdjustment: adjusted.terrainAdjustment,
      tubelessBonus: adjusted.tubelessBonus,
      totalAdjustment: adjusted.totalAdjustment,
    },
    terrainBased: adjusted.terrainBased,
    isValid: validation.valid,
    warnings: validation.warnings,
    terrainProfile: {
      composition: terrainProfile.composition,
      scores: terrainProfile.scores,
    },
  };
}