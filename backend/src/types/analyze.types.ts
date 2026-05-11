import type { SurfaceType, OsmEnrichmentStatus } from '../services/osm/osm.types.js';

export type BikeType = 'trail' | 'enduro' | 'xc' | 'downhill' | 'gravel';

export type RidingStyle = 'conservative' | 'moderate' | 'aggressive';

export type DifficultyRating = 'easy' | 'moderate' | 'hard' | 'expert';

export type InputMode = 'gpx' | 'manual';

export interface TerrainComposition {
  asphalt: number;
  gravel: number;
  dirt: number;
  rocky: number;
  technical: number;
}

export interface TerrainScores {
  roughness: number;
  technicality: number;
  flow: number;
}

export interface TerrainProfile {
  composition: TerrainComposition;
  scores: TerrainScores;
  osmEnrichmentStatus?: OsmEnrichmentStatus;
}

export interface ManualTerrainInput {
  asphalt?: number;
  gravel?: number;
  dirt?: number;
  rocky?: number;
  technical?: number;
}

export interface RiderInput {
  riderWeight: number;
  bikeType: BikeType;
  tireWidth: number;
  tubeless: boolean;
  ridingStyle: RidingStyle;
}

export interface RiderInputV2 extends RiderInput {
  manualTerrain?: ManualTerrainInput;
}

export interface TerrainFlags {
  rockyTerrain: boolean;
  wetRoots: boolean;
  fastFlowTrail: boolean;
  longGravelRide: boolean;
  technicalDescent: boolean;
}

export interface RouteMetrics {
  totalDistance: number;
  elevationGain: number;
  elevationLoss: number;
  maxGradient: number;
  avgGradient: number;
  difficultyRating: DifficultyRating;
}

export interface PressureRecommendation {
  frontPsi: number;
  rearPsi: number;
}

export interface AIRecommendation {
  frontPsi: number;
  rearPsi: number;
  reasoning: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface AnalyzeResponse {
  baseline: PressureRecommendation;
  adjusted: PressureRecommendation;
  aiRecommendation: AIRecommendation;
  routeMetrics?: RouteMetrics;
  terrainFlags?: TerrainFlags;
}

export interface AnalyzeResponseV2 extends AnalyzeResponse {
  terrainProfile?: TerrainProfile;
  osmEnrichmentStatus?: OsmEnrichmentStatus;
  inputMode: InputMode;
  terrainBased?: {
    composition: TerrainComposition;
    appliedWeights: { surface: string; weight: number; contribution: number }[];
  };
}

export interface AnalyzeRequest extends RiderInput {
  gpxContent: string;
}