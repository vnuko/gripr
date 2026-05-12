import type { ParsedTrackPoint } from '../gpx/gpx.types.js';
import type {
  OsmWay,
  OsmSegment,
  MapMatchingResult,
  OverpassQueryParams,
} from './osm.types.js';
import {
  queryOsmWays,
  filterRelevantWays,
  calculateBboxFromPoints,
  validateBbox,
  OsmClientError,
} from './osm-client.service.js';
import { MATCHING_CONFIG } from '../../utils/constants.js';

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function distanceToSegment(
  pointLat: number,
  pointLon: number,
  segStartLat: number,
  segStartLon: number,
  segEndLat: number,
  segEndLon: number
): number {
  const dx = segEndLon - segStartLon;
  const dy = segEndLat - segStartLat;
  
  if (dx === 0 && dy === 0) {
    return calculateDistanceMeters(pointLat, pointLon, segStartLat, segStartLon);
  }
  
  const t = Math.max(0, Math.min(1,
    ((pointLon - segStartLon) * dx + (pointLat - segStartLat) * dy) /
    (dx * dx + dy * dy)
  ));
  
  const projLon = segStartLon + t * dx;
  const projLat = segStartLat + t * dy;
  
  return calculateDistanceMeters(pointLat, pointLon, projLat, projLon);
}

export function findNearestWay(
  point: { lat: number; lon: number },
  ways: OsmWay[]
): { way: OsmWay; distance: number; segmentIndex: number } | null {
  if (!ways.length) return null;
  
  let minDistance = Infinity;
  let nearestWay: OsmWay | null = null;
  let nearestSegmentIndex = 0;
  
  for (const way of ways) {
    if (!way.geometry || way.geometry.length < 2) continue;
    
    for (let i = 0; i < way.geometry.length - 1; i++) {
      const start = way.geometry[i];
      const end = way.geometry[i + 1];
      
      if (!start || !end) continue;
      
      const distance = distanceToSegment(
        point.lat,
        point.lon,
        start.lat,
        start.lon,
        end.lat,
        end.lon
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestWay = way;
        nearestSegmentIndex = i;
      }
    }
  }
  
  if (!nearestWay || minDistance > MATCHING_CONFIG.MAX_SNAP_DISTANCE_M) {
    return null;
  }
  
  return {
    way: nearestWay,
    distance: minDistance,
    segmentIndex: nearestSegmentIndex,
  };
}

export function determineConfidence(distanceMeters: number): 'high' | 'medium' | 'low' {
  if (distanceMeters <= MATCHING_CONFIG.HIGH_CONFIDENCE_THRESHOLD_M) {
    return 'high';
  }
  if (distanceMeters <= MATCHING_CONFIG.MEDIUM_CONFIDENCE_THRESHOLD_M) {
    return 'medium';
  }
  return 'low';
}

export function matchPointsToWays(
  points: ParsedTrackPoint[],
  ways: OsmWay[]
): MapMatchingResult {
  const matchedSegments: OsmSegment[] = [];
  const unmatchedPoints: { lat: number; lon: number; index: number }[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!point) continue;
    
    const nearest = findNearestWay({ lat: point.latitude, lon: point.longitude }, ways);
    
    if (nearest) {
      const segment: OsmSegment = {
        lat: point.latitude,
        lon: point.longitude,
        osmId: `${nearest.way.type}/${nearest.way.id}`,
        highway: nearest.way.tags?.highway ?? 'unknown',
        distanceFromPoint: nearest.distance,
      };
      
      if (nearest.way.tags?.surface !== undefined) {
        segment.surface = nearest.way.tags.surface;
      }
      if (nearest.way.tags?.smoothness !== undefined) {
        segment.smoothness = nearest.way.tags.smoothness;
      }
      if (nearest.way.tags?.mtbScale !== undefined) {
        segment.mtbScale = nearest.way.tags.mtbScale;
      }
      
      matchedSegments.push(segment);
    } else {
      unmatchedPoints.push({
        lat: point.latitude,
        lon: point.longitude,
        index: i,
      });
    }
  }
  
  const matchRate = points.length > 0
    ? matchedSegments.length / points.length
    : 0;
  
  return {
    matchedSegments,
    unmatchedPoints,
    matchRate,
  };
}

export async function performMapMatching(
  points: ParsedTrackPoint[]
): Promise<MapMatchingResult> {
  if (points.length === 0) {
    return {
      matchedSegments: [],
      unmatchedPoints: [],
      matchRate: 0,
    };
  }
  
  const bbox = calculateBboxFromPoints(
    points.map(p => ({ lat: p.latitude, lon: p.longitude })),
    0.1
  );
  
  if (!validateBbox(bbox)) {
    throw new OsmClientError(
      'Route bounding box exceeds maximum allowed area. Route may be too large for OSM enrichment.',
      undefined,
      false
    );
  }
  
  const queryParams: OverpassQueryParams = { bbox };
  const response = await queryOsmWays(queryParams);
  
  const relevantWays = filterRelevantWays(response.elements);
  
  const result = matchPointsToWays(points, relevantWays);
  
  return result;
}

export function isMatchSufficient(result: MapMatchingResult): boolean {
  return result.matchRate >= MATCHING_CONFIG.MIN_MATCH_RATE_FOR_OSM;
}