export type SurfaceType = 'asphalt' | 'gravel' | 'dirt' | 'rocky' | 'technical';

export interface OsmTags {
  surface?: string;
  highway?: string;
  smoothness?: string;
  tracktype?: string;
  mtbScale?: string;
  incline?: string;
  name?: string;
}

export interface OsmSegment {
  lat: number;
  lon: number;
  osmId: string;
  highway: string;
  surface?: string;
  smoothness?: string;
  mtbScale?: string;
  distanceFromPoint: number;
}

export interface OsmWay {
  id: number;
  type: 'way';
  nodes: number[];
  tags: OsmTags;
  geometry?: { lat: number; lon: number }[];
}

export interface OsmNode {
  id: number;
  type: 'node';
  lat: number;
  lon: number;
  tags?: OsmTags;
}

export interface OverpassResponse {
  elements: (OsmWay | OsmNode)[];
  remark?: string;
}

export interface OverpassQueryParams {
  bbox: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
  filters?: string[];
}

export interface SegmentEnrichment {
  segmentIndex: number;
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  distance: number;
  classifiedSurface: SurfaceType;
  osmTags: OsmTags;
  confidence: 'high' | 'medium' | 'low';
  fallbackUsed: boolean;
}

export interface OsmEnrichmentStatus {
  osmAvailable: boolean;
  segmentsProcessed: number;
  segmentsWithOsmData: number;
  fallbackSegments: number;
  fallbackMode?: 'level1Heuristics' | 'default' | 'manual';
  error?: string;
}

export interface MapMatchingResult {
  matchedSegments: OsmSegment[];
  unmatchedPoints: { lat: number; lon: number; index: number }[];
  matchRate: number;
}

export interface RouteCacheKey {
  hash: string;
  pointCount: number;
  bbox: OverpassQueryParams['bbox'];
}