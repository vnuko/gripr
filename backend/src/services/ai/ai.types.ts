import type { TerrainProfile } from '../terrain/terrain.types.js';
import type { InputMode, RouteMetrics, SkillLevel } from '../../types/analyze.types';

export interface AIContext {
  riderWeight: number;
  bikeType: string;
  tireWidth: number;
  tubeless: boolean;
  ridingStyle: string;
  terrainFlags: {
    rockyTerrain: boolean;
    wetRoots: boolean;
    fastFlowTrail: boolean;
    longGravelRide: boolean;
    technicalDescent: boolean;
  };
  routeMetrics: {
    totalDistance: number;
    elevationGain: number;
    elevationLoss: number;
    maxGradient: number;
    avgGradient: number;
    difficultyRating: string;
  };
  baselinePsi: {
    front: number;
    rear: number;
  };
  adjustedPsi: {
    front: number;
    rear: number;
  };
}

export interface AIContextV2 {
  riderWeight: number;
  bikeType: string;
  tireWidth: number;
  tubeless: boolean;
  ridingStyle: string;
  skillLevel: SkillLevel;
  terrainProfile: TerrainProfile;
  routeMetrics?: RouteMetrics;
  baselinePsi: { front: number; rear: number };
  adjustedPsi: { front: number; rear: number };
  inputMode: InputMode;
}

export interface AIContextV2 {
  riderWeight: number;
  bikeType: string;
  tireWidth: number;
  tubeless: boolean;
  ridingStyle: string;
  terrainProfile: TerrainProfile;
  routeMetrics?: RouteMetrics;
  baselinePsi: { front: number; rear: number };
  adjustedPsi: { front: number; rear: number };
  inputMode: InputMode;
}

export interface AIRecommendation {
  frontPsi: number;
  rearPsi: number;
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
  warnings?: string[];
}

export interface AIResponse {
  success: boolean;
  recommendation?: AIRecommendation;
  error?: string;
  fallbackUsed?: boolean;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}