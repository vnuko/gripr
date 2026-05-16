import type { SurfaceType, OsmEnrichmentStatus } from '../osm/osm.types.js';

export interface TerrainTimelineSegment {
  index: number;
  startPoint: { lat: number; lon: number; elevation: number | null };
  endPoint: { lat: number; lon: number; elevation: number | null };
  distance: number;
  surface: SurfaceType;
  gradient: number;
  confidence: 'high' | 'medium' | 'low';
  fallbackUsed: boolean;
  enrichmentStartIndex?: number;
  enrichmentEndIndex?: number;
  representativeEnrichmentIndex?: number;
}

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
  segments?: TerrainTimelineSegment[];
  osmEnrichmentStatus?: OsmEnrichmentStatus;
}
