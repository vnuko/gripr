import type { TerrainComposition, TerrainScores, TerrainProfile } from '../terrain/terrain.types.js';
import type { TerrainClassification } from '../terrain/terrain.types.js';

export interface PressureInput {
  riderWeight: number;
  bikeType: 'trail' | 'enduro' | 'xc' | 'downhill' | 'gravel';
  tireWidth: number;
  tubeless: boolean;
  ridingStyle: 'conservative' | 'moderate' | 'aggressive';
}

export interface BaselinePressure {
  frontPsi: number;
  rearPsi: number;
  weightAdjustment: number;
  widthAdjustment: number;
  styleAdjustment: number;
}

export interface AdjustedPressure {
  frontPsi: number;
  rearPsi: number;
  terrainAdjustment: number;
  tubelessBonus: number;
  totalAdjustment: number;
}

export interface TerrainBasedAdjustment {
  frontPsiAdjustment: number;
  rearPsiAdjustment: number;
  composition: TerrainComposition;
  appliedWeights: {
    surface: string;
    weight: number;
    modifier: number;
    contribution: number;
  }[];
}

export interface PressureResult {
  baseline: BaselinePressure;
  adjusted: AdjustedPressure;
  isValid: boolean;
  warnings: string[];
}

export interface PressureResultV2 {
  baseline: BaselinePressure;
  adjusted: AdjustedPressure;
  terrainBased: TerrainBasedAdjustment;
  isValid: boolean;
  warnings: string[];
  terrainProfile?: {
    composition: TerrainComposition;
    scores: TerrainScores;
  };
}