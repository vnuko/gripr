import type { ParsedTrackPoint } from '../gpx/gpx.types.js';
import type { SegmentEnrichment, SurfaceType } from '../osm/osm.types.js';
import type { TerrainTimelineSegment } from './terrain.types.js';
import { SEGMENTATION_CONFIG } from '../../utils/constants.js';
import { calculateDistanceMeters } from '../osm/map-matching.service.js';

export function calculateSegmentGradient(
  startElevation: number | null,
  endElevation: number | null,
  distanceMeters: number
): number {
  if (startElevation === null || endElevation === null) return 0;
  if (distanceMeters === 0) return 0;
  
  const elevationDelta = endElevation - startElevation;
  return (elevationDelta / distanceMeters) * 100;
}

export function determineSegmentLength(
  points: ParsedTrackPoint[],
  currentIndex: number
): number {
  const remainingPoints = points.length - currentIndex;
  
  if (remainingPoints < SEGMENTATION_CONFIG.MIN_POINTS_PER_SEGMENT) {
    return 0;
  }
  
  let avgDistance = 0;
  const checkCount = Math.min(5, remainingPoints - 1);
  
  for (let i = 0; i < checkCount; i++) {
    const p1 = points[currentIndex + i];
    const p2 = points[currentIndex + i + 1];
    if (p1 && p2) {
      avgDistance += calculateDistanceMeters(
        p1.latitude, p1.longitude,
        p2.latitude, p2.longitude
      );
    }
  }
  
  avgDistance /= checkCount || 1;
  
  if (avgDistance < 10) return SEGMENTATION_CONFIG.MIN_SEGMENT_LENGTH_M;
  
  if (avgDistance > 50) return SEGMENTATION_CONFIG.MAX_SEGMENT_LENGTH_M;
  
  return SEGMENTATION_CONFIG.ADAPTIVE_THRESHOLD_M;
}

export function findSegmentEndIndex(
  points: ParsedTrackPoint[],
  startIndex: number,
  targetLengthM: number
): number {
  let accumulatedDistance = 0;
  
  for (let i = startIndex; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    if (!p1 || !p2) continue;
    
    const segmentDistance = calculateDistanceMeters(
      p1.latitude, p1.longitude,
      p2.latitude, p2.longitude
    );
    
    accumulatedDistance += segmentDistance;
    
    if (accumulatedDistance >= targetLengthM) {
      return i + 1;
    }
  }
  
  return points.length - 1;
}

export function createTerrainSegment(
  enrichment: SegmentEnrichment,
  startPoint: { lat: number; lon: number; elevation: number | null },
  endPoint: { lat: number; lon: number; elevation: number | null },
  distance: number,
  index: number
): TerrainTimelineSegment {
  const gradient = calculateSegmentGradient(
    startPoint.elevation,
    endPoint.elevation,
    distance
  );
  
  return {
    index,
    startPoint,
    endPoint,
    distance,
    surface: enrichment.classifiedSurface,
    gradient,
    confidence: enrichment.confidence,
    fallbackUsed: enrichment.fallbackUsed,
  };
}

export function segmentRoute(
  points: ParsedTrackPoint[],
  enrichments: SegmentEnrichment[]
): TerrainTimelineSegment[] {
  if (points.length < 2) {
    return [];
  }
  
  const segments: TerrainTimelineSegment[] = [];
  let currentIndex = 0;
  let segmentIndex = 0;
  
  while (currentIndex < points.length - 1) {
    const targetLength = determineSegmentLength(points, currentIndex);
    
    if (targetLength === 0) {
      const start = points[currentIndex];
      const end = points[points.length - 1];
      
      if (start && end) {
        const totalDistance = calculateDistanceMeters(
          start.latitude, start.longitude,
          end.latitude, end.longitude
        );
        
        const enrichment = enrichments[currentIndex] ?? enrichments[enrichments.length - 1];
        
        if (enrichment) {
          segments.push(createTerrainSegment(
            enrichment,
            { lat: start.latitude, lon: start.longitude, elevation: start.elevation },
            { lat: end.latitude, lon: end.longitude, elevation: end.elevation },
            totalDistance,
            segmentIndex
          ));
        }
      }
      
      break;
    }
    
    const endIndex = findSegmentEndIndex(points, currentIndex, targetLength);
    
    const startPoint = points[currentIndex];
    const endPoint = points[endIndex];
    
    if (startPoint && endPoint) {
      let segmentDistance = 0;
      for (let i = currentIndex; i < endIndex; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        if (p1 && p2) {
          segmentDistance += calculateDistanceMeters(
            p1.latitude, p1.longitude,
            p2.latitude, p2.longitude
          );
        }
      }
      
      const enrichment = enrichments[currentIndex] ?? enrichments[0];
      
      if (enrichment) {
        segments.push(createTerrainSegment(
          enrichment,
          { lat: startPoint.latitude, lon: startPoint.longitude, elevation: startPoint.elevation },
          { lat: endPoint.latitude, lon: endPoint.longitude, elevation: endPoint.elevation },
          segmentDistance,
          segmentIndex
        ));
        
        segmentIndex++;
      }
      
      currentIndex = endIndex;
    } else {
      currentIndex++;
    }
  }
  
  return segments;
}

export function getTerrainTimelineSummary(
  segments: TerrainTimelineSegment[]
): {
  totalDistance: number;
  segmentCount: number;
  surfaceBreakdown: Record<SurfaceType, number>;
  averageGradient: number;
} {
  const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);
  const segmentCount = segments.length;
  
  const surfaceBreakdown: Record<SurfaceType, number> = {
    asphalt: 0,
    gravel: 0,
    dirt: 0,
    rocky: 0,
    technical: 0,
  };
  
  for (const segment of segments) {
    surfaceBreakdown[segment.surface] += segment.distance;
  }
  
  const gradientsWithDistance = segments.filter(s => s.distance > 0);
  const averageGradient = gradientsWithDistance.length > 0
    ? gradientsWithDistance.reduce((sum, s) => sum + Math.abs(s.gradient) * s.distance, 0) / totalDistance
    : 0;
  
  return {
    totalDistance,
    segmentCount,
    surfaceBreakdown,
    averageGradient,
  };
}