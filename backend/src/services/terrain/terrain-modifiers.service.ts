import { TERRAIN_MODIFIERS } from '../../utils/constants.js';
import type {
  TerrainClassification,
  TerrainModifierResult,
  AppliedModifier,
} from './terrain.types.js';

export function applyTerrainModifiers(
  terrain: TerrainClassification,
  _baseFrontPsi: number,
  _baseRearPsi: number
): TerrainModifierResult {
  const appliedModifiers: AppliedModifier[] = [];

  let frontAdjustment = 0;
  let rearAdjustment = 0;

  if (terrain.rockyTerrain) {
    const modifier = TERRAIN_MODIFIERS.ROCKY_TERRAIN;
    frontAdjustment += modifier;
    rearAdjustment += modifier;
    appliedModifiers.push({ condition: 'Rocky terrain', adjustment: modifier });
  }

  if (terrain.wetRoots) {
    const modifier = TERRAIN_MODIFIERS.WET_ROOTS;
    frontAdjustment += modifier;
    rearAdjustment += modifier;
    appliedModifiers.push({ condition: 'Wet roots', adjustment: modifier });
  }

  if (terrain.fastFlowTrail) {
    const modifier = TERRAIN_MODIFIERS.FAST_FLOW_TRAIL;
    frontAdjustment += modifier;
    rearAdjustment += modifier;
    appliedModifiers.push({ condition: 'Fast flow trail', adjustment: modifier });
  }

  if (terrain.longGravelRide) {
    const modifier = TERRAIN_MODIFIERS.LONG_GRAVEL_RIDE;
    frontAdjustment += modifier;
    rearAdjustment += modifier;
    appliedModifiers.push({ condition: 'Long gravel ride', adjustment: modifier });
  }

  if (terrain.technicalDescent) {
    const modifier = TERRAIN_MODIFIERS.TECHNICAL_DESCENT;
    frontAdjustment += modifier;
    rearAdjustment += modifier;
    appliedModifiers.push({ condition: 'Technical descent', adjustment: modifier });
  }

  return {
    frontPsiAdjustment: frontAdjustment,
    rearPsiAdjustment: rearAdjustment,
    appliedModifiers,
  };
}

export function calculateAdjustedPsi(
  baseFrontPsi: number,
  baseRearPsi: number,
  modifiers: TerrainModifierResult
): { frontPsi: number; rearPsi: number } {
  return {
    frontPsi: baseFrontPsi + modifiers.frontPsiAdjustment,
    rearPsi: baseRearPsi + modifiers.rearPsiAdjustment,
  };
}