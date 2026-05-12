import logger from '../../utils/logger.js';
import type {
  OsmSegment,
  SurfaceType,
  SegmentEnrichment,
  OsmEnrichmentStatus,
  OsmTags,
} from './osm.types.js';
import type { ParsedTrackPoint } from '../gpx/gpx.types.js';
import {
  OSM_SURFACE_MAPPING,
  OSM_HIGHWAY_MAPPING,
  MTB_SCALE_MAPPING,
  OSM_SMOOTHNESS_MAPPING,
} from '../../utils/constants.js';
import { performMapMatching, isMatchSufficient } from './map-matching.service.js';

export function classifySurfaceType(tags: OsmTags): SurfaceType {
  if (tags.surface) {
    const mapped = OSM_SURFACE_MAPPING[tags.surface];
    if (mapped) return mapped;
  }
  
  if (tags.mtbScale) {
    const mapped = MTB_SCALE_MAPPING[tags.mtbScale];
    if (mapped) return mapped;
  }
  
  if (tags.smoothness) {
    const mapped = OSM_SMOOTHNESS_MAPPING[tags.smoothness];
    if (mapped) return mapped.surface;
  }
  
  if (tags.highway) {
    const mapped = OSM_HIGHWAY_MAPPING[tags.highway];
    if (mapped) return mapped;
  }
  
  return 'dirt';
}

export function determineEnrichmentConfidence(tags: OsmTags, distance: number): 'high' | 'medium' | 'low' {
  if (tags.surface && distance < 10) return 'high';
  
  if (tags.highway && (tags.mtbScale || tags.smoothness || distance < 20)) return 'medium';
  
  return 'low';
}

export function calculateRoughnessFromTags(tags: OsmTags): number {
  let roughness = 0.3;
  
  if (tags.smoothness) {
    const mapped = OSM_SMOOTHNESS_MAPPING[tags.smoothness];
    if (mapped) {
      roughness = mapped.roughness;
    }
  }
  
  if (tags.mtbScale) {
    const scale = parseInt(tags.mtbScale, 10);
    if (scale >= 3) roughness = Math.max(roughness, 0.7);
    if (scale >= 4) roughness = Math.max(roughness, 0.85);
    if (scale >= 5) roughness = Math.max(roughness, 0.95);
  }
  
  if (tags.surface) {
    if (['asphalt', 'paved', 'concrete'].includes(tags.surface)) {
      roughness = Math.min(roughness, 0.2);
    } else if (['rock', 'stone'].includes(tags.surface)) {
      roughness = Math.max(roughness, 0.8);
    }
  }
  
  return Math.min(1, Math.max(0, roughness));
}

export function enrichSegment(
  segment: OsmSegment,
  index: number
): SegmentEnrichment {
  const osmTags: OsmTags = {
    highway: segment.highway,
  };
  
  if (segment.surface !== undefined) {
    osmTags.surface = segment.surface;
  }
  if (segment.smoothness !== undefined) {
    osmTags.smoothness = segment.smoothness;
  }
  if (segment.mtbScale !== undefined) {
    osmTags.mtbScale = segment.mtbScale;
  }
  
  return {
    segmentIndex: index,
    startLat: segment.lat,
    startLon: segment.lon,
    endLat: segment.lat,
    endLon: segment.lon,
    distance: 0,
    classifiedSurface: classifySurfaceType(osmTags),
    osmTags,
    confidence: determineEnrichmentConfidence(osmTags, segment.distanceFromPoint),
    fallbackUsed: false,
  };
}

export function createFallbackSegment(
  point: { lat: number; lon: number; index: number },
  fallbackSurface: SurfaceType = 'dirt'
): SegmentEnrichment {
  return {
    segmentIndex: point.index,
    startLat: point.lat,
    startLon: point.lon,
    endLat: point.lat,
    endLon: point.lon,
    distance: 0,
    classifiedSurface: fallbackSurface,
    osmTags: {},
    confidence: 'low',
    fallbackUsed: true,
  };
}

export async function enrichRouteWithOsm(
  points: ParsedTrackPoint[]
): Promise<{
  enrichments: SegmentEnrichment[];
  status: OsmEnrichmentStatus;
}> {
  const lastPoint = points.length > 0 ? points[points.length - 1] : undefined;
  logger.substep('Route Enrichment', {
    pointCount: points.length,
    firstPoint: points[0] ? { lat: points[0].latitude, lon: points[0].longitude } : null,
    lastPoint: lastPoint ? { lat: lastPoint.latitude, lon: lastPoint.longitude } : null,
  });
  
  if (points.length === 0) {
    logger.warn('No Points to Enrich', 'Empty points array');
    return {
      enrichments: [],
      status: {
        osmAvailable: false,
        segmentsProcessed: 0,
        segmentsWithOsmData: 0,
        fallbackSegments: 0,
        fallbackMode: 'default',
        error: 'No points to enrich',
      },
    };
  }
  
  try {
    logger.time('map-matching');
    const matchResult = await performMapMatching(points);
    const matchingDuration = logger.timeEnd('map-matching');
    
    logger.debug('Map Matching Result', {
      duration: matchingDuration + ' ms',
      matchRate: matchResult.matchRate?.toFixed(2),
      matchedSegments: matchResult.matchedSegments?.length ?? 0,
      unmatchedPoints: matchResult.unmatchedPoints?.length ?? 0,
    });
    
    if (!isMatchSufficient(matchResult)) {
      logger.warn('Map Match Insufficient', `Match rate ${matchResult.matchRate.toFixed(2)} below threshold`, {
        matchRate: matchResult.matchRate,
        matchedSegments: matchResult.matchedSegments.length,
        unmatchedPoints: matchResult.unmatchedPoints.length,
      });
      
      return {
        enrichments: points.map((p, i) => 
          createFallbackSegment({ lat: p.latitude, lon: p.longitude, index: i })
        ),
        status: {
          osmAvailable: false,
          segmentsProcessed: points.length,
          segmentsWithOsmData: 0,
          fallbackSegments: points.length,
          fallbackMode: 'level1Heuristics',
          error: `Match rate ${matchResult.matchRate.toFixed(2)} below threshold`,
        },
      };
    }
    
    const matchedEnrichments = matchResult.matchedSegments.map((seg, i) => 
      enrichSegment(seg, i)
    );
    
    logger.debug('Matched Segments Enriched', {
      count: matchedEnrichments.length,
      sampleEnrichments: matchedEnrichments.slice(0, 5).map(e => ({
        index: e.segmentIndex,
        surface: e.classifiedSurface,
        confidence: e.confidence,
        tags: e.osmTags,
      })),
    });
    
    const fallbackEnrichments = matchResult.unmatchedPoints.map(p => 
      createFallbackSegment(p)
    );
    
    if (fallbackEnrichments.length > 0) {
      logger.debug('Fallback Segments Created', {
        count: fallbackEnrichments.length,
        sampleFallbacks: fallbackEnrichments.slice(0, 3).map(e => ({
          index: e.segmentIndex,
          surface: e.classifiedSurface,
          fallbackUsed: e.fallbackUsed,
        })),
      });
    }
    
    const allEnrichments = [...matchedEnrichments, ...fallbackEnrichments]
      .sort((a, b) => a.segmentIndex - b.segmentIndex);
    
    const status: OsmEnrichmentStatus = {
      osmAvailable: true,
      segmentsProcessed: points.length,
      segmentsWithOsmData: matchedEnrichments.length,
      fallbackSegments: fallbackEnrichments.length,
    };
    
    logger.success('Route Enrichment Complete', {
      totalEnrichments: allEnrichments.length,
      osmAvailable: status.osmAvailable,
      segmentsProcessed: status.segmentsProcessed,
      segmentsWithOsmData: status.segmentsWithOsmData,
      fallbackSegments: status.fallbackSegments,
      matchRate: ((matchedEnrichments.length / points.length) * 100).toFixed(1) + '%',
    });
    
    return {
      enrichments: allEnrichments,
      status,
    };
    
  } catch (error) {
    logger.error('Route Enrichment Failed', error instanceof Error ? error : new Error('Unknown error'));
    
    return {
      enrichments: points.map((p, i) => 
        createFallbackSegment({ lat: p.latitude, lon: p.longitude, index: i })
      ),
      status: {
        osmAvailable: false,
        segmentsProcessed: points.length,
        segmentsWithOsmData: 0,
        fallbackSegments: points.length,
        fallbackMode: 'level1Heuristics',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}