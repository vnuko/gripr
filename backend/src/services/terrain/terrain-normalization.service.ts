import type { TerrainTimelineSegment, TerrainComposition, TerrainScores, TerrainProfile } from './terrain.types.js';
import type { SegmentEnrichment, OsmEnrichmentStatus } from '../osm/osm.types.js';
import type { RouteMetrics } from '../../types/analyze.types.js';
import { TERRAIN_SCORE_WEIGHTS } from '../../utils/constants.js';

export function calculateTerrainComposition(
  segments: TerrainTimelineSegment[]
): TerrainComposition {
  const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);
  
  if (totalDistance === 0) {
    return {
      asphalt: 0,
      gravel: 0,
      dirt: 0,
      rocky: 0,
      technical: 0,
    };
  }
  
  const composition: TerrainComposition = {
    asphalt: 0,
    gravel: 0,
    dirt: 0,
    rocky: 0,
    technical: 0,
  };
  
  for (const segment of segments) {
    composition[segment.surface] += segment.distance;
  }
  
  for (const surface of Object.keys(composition) as (keyof TerrainComposition)[]) {
    composition[surface] = composition[surface] / totalDistance;
  }
  
  return composition;
}

export function validateComposition(composition: TerrainComposition): boolean {
  const sum = Object.values(composition).reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1.0) < 0.01;
}

export function normalizeComposition(composition: TerrainComposition): TerrainComposition {
  const sum = Object.values(composition).reduce((a, b) => a + b, 0);
  
  if (sum === 0) {
    return {
      asphalt: 0,
      gravel: 0,
      dirt: 1,
      rocky: 0,
      technical: 0,
    };
  }
  
  const normalized: TerrainComposition = {
    asphalt: composition.asphalt / sum,
    gravel: composition.gravel / sum,
    dirt: composition.dirt / sum,
    rocky: composition.rocky / sum,
    technical: composition.technical / sum,
  };
  
  return normalized;
}

export function calculateRoughnessScore(
  segments: TerrainTimelineSegment[],
  enrichments: SegmentEnrichment[]
): number {
  if (segments.length === 0) return 0.3;
  
  const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);
  if (totalDistance === 0) return 0.3;
  
  let weightedRoughness = 0;
  
  for (const segment of segments) {
    const enrichment = enrichments[segment.index];
    if (!enrichment) continue;
    
    let surfaceRoughness = 0.3;
    
    switch (segment.surface) {
      case 'asphalt': surfaceRoughness = 0.1; break;
      case 'gravel': surfaceRoughness = 0.4; break;
      case 'dirt': surfaceRoughness = 0.5; break;
      case 'rocky': surfaceRoughness = 0.8; break;
      case 'technical': surfaceRoughness = 0.9; break;
    }
    
    if (enrichment.osmTags.smoothness) {
      const smoothnessMap: Record<string, number> = {
        excellent: 0.1,
        good: 0.2,
        intermediate: 0.4,
        bad: 0.6,
        very_bad: 0.8,
        horrible: 0.9,
      };
      surfaceRoughness = smoothnessMap[enrichment.osmTags.smoothness] ?? surfaceRoughness;
    }
    
    if (enrichment.osmTags.mtbScale) {
      const scale = parseInt(enrichment.osmTags.mtbScale, 10);
      if (scale >= 3) surfaceRoughness = Math.max(surfaceRoughness, 0.7);
      if (scale >= 5) surfaceRoughness = Math.max(surfaceRoughness, 0.9);
    }
    
    weightedRoughness += surfaceRoughness * (segment.distance / totalDistance);
  }
  
  return Math.min(1, Math.max(0, weightedRoughness));
}

export function calculateTechnicalityScore(
  segments: TerrainTimelineSegment[],
  routeMetrics: RouteMetrics
): number {
  if (segments.length === 0) return 0.3;
  
  let score = 0;
  const weights = TERRAIN_SCORE_WEIGHTS.technicality;
  
  const gradientScore = Math.min(1, Math.abs(routeMetrics.maxGradient) / 30);
  score += gradientScore * weights.gradient;
  
  const technicalSurfaces = segments.filter(s => 
    s.surface === 'technical' || s.surface === 'rocky'
  );
  const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);
  const technicalRatio = totalDistance > 0
    ? technicalSurfaces.reduce((sum, s) => sum + s.distance, 0) / totalDistance
    : 0;
  score += technicalRatio * weights.mtbScale;
  
  const gradients = segments.map(s => s.gradient);
  const gradientVariance = calculateVariance(gradients);
  const varianceScore = Math.min(1, gradientVariance / 10);
  score += varianceScore * weights.directionChanges;
  
  return Math.min(1, Math.max(0, score));
}

export function calculateFlowScore(
  segments: TerrainTimelineSegment[],
  routeMetrics: RouteMetrics
): number {
  if (segments.length === 0) return 0.5;
  
  let score = 0;
  const weights = TERRAIN_SCORE_WEIGHTS.flow;
  
  const gradients = segments.map(s => Math.abs(s.gradient));
  const gradientVariance = calculateVariance(gradients);
  const consistencyScore = 1 - Math.min(1, gradientVariance / 15);
  score += consistencyScore * weights.gradientConsistency;
  
  const distances = segments.map(s => s.distance);
  const distanceVariance = calculateVariance(distances);
  const lengthConsistency = 1 - Math.min(1, distanceVariance / 10000);
  score += lengthConsistency * weights.segmentLengthConsistency;
  
  const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);
  const smoothSurfaces = segments.filter(s => 
    s.surface === 'asphalt' || s.surface === 'gravel'
  );
  const smoothRatio = totalDistance > 0
    ? smoothSurfaces.reduce((sum, s) => sum + s.distance, 0) / totalDistance
    : 0;
  score += smoothRatio * weights.smoothness;
  
  return Math.min(1, Math.max(0, score));
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

export function calculateTerrainScores(
  segments: TerrainTimelineSegment[],
  enrichments: SegmentEnrichment[],
  routeMetrics: RouteMetrics
): TerrainScores {
  return {
    roughness: calculateRoughnessScore(segments, enrichments),
    technicality: calculateTechnicalityScore(segments, routeMetrics),
    flow: calculateFlowScore(segments, routeMetrics),
  };
}

export function buildTerrainProfile(
  segments: TerrainTimelineSegment[],
  enrichments: SegmentEnrichment[],
  routeMetrics: RouteMetrics,
  osmStatus?: OsmEnrichmentStatus
): TerrainProfile {
  const composition = calculateTerrainComposition(segments);
  const normalizedComposition = normalizeComposition(composition);
  const scores = calculateTerrainScores(segments, enrichments, routeMetrics);
  
  return {
    composition: normalizedComposition,
    scores,
    segments,
    osmEnrichmentStatus: osmStatus,
  };
}

export function buildManualTerrainProfile(
  manualInput: {
    asphalt?: number;
    gravel?: number;
    dirt?: number;
    rocky?: number;
    technical?: number;
  }
): TerrainProfile {
  const composition: TerrainComposition = {
    asphalt: manualInput.asphalt ?? 0,
    gravel: manualInput.gravel ?? 0,
    dirt: manualInput.dirt ?? 0,
    rocky: manualInput.rocky ?? 0,
    technical: manualInput.technical ?? 0,
  };
  
  const normalized = normalizeComposition(composition);
  
  const roughness = 
    normalized.asphalt * 0.1 +
    normalized.gravel * 0.4 +
    normalized.dirt * 0.5 +
    normalized.rocky * 0.8 +
    normalized.technical * 0.9;
  
  const technicality = normalized.rocky + normalized.technical;
  
  const flow = normalized.asphalt + normalized.gravel * 0.5;
  
  return {
    composition: normalized,
    scores: {
      roughness,
      technicality,
      flow,
    },
    osmEnrichmentStatus: {
      osmAvailable: false,
      segmentsProcessed: 0,
      segmentsWithOsmData: 0,
      fallbackSegments: 0,
      fallbackMode: 'manual',
    },
  };
}