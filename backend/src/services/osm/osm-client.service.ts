import logger from '../../utils/logger.js';
import type {
  OverpassResponse,
  OverpassQueryParams,
  OsmWay,
} from './osm.types.js';
import {
  OSM_CONFIG,
} from '../../utils/constants.js';

const queryCache = new Map<string, { data: OverpassResponse; timestamp: number }>();

export class OsmClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly isRetryable: boolean = true
  ) {
    super(message);
    this.name = 'OsmClientError';
  }
}

export function buildOverpassQuery(params: OverpassQueryParams): string {
  const { south, west, north, east } = params.bbox;
  
  const query = `[out:json][timeout:${OSM_CONFIG.REQUEST_TIMEOUT_MS / 1000}];way["highway"](${south},${west},${north},${east});out geom;`;
  
  return query;
}

export function buildWayIdsQuery(wayIds: number[]): string {
  const ids = wayIds.join(',');
  return `[out:json][timeout:${OSM_CONFIG.REQUEST_TIMEOUT_MS / 1000}];way(id:${ids});out geom;`;
}

export function generateCacheKey(params: OverpassQueryParams): string {
  const { south, west, north, east } = params.bbox;
  return `bbox:${south}:${west}:${north}:${east}`;
}

export function isCacheValid(cacheKey: string): boolean {
  if (!OSM_CONFIG.CACHE_ENABLED) return false;
  
  const cached = queryCache.get(cacheKey);
  if (!cached) return false;
  
  const ageSeconds = (Date.now() - cached.timestamp) / 1000;
  return ageSeconds < OSM_CONFIG.CACHE_TTL_SECONDS;
}

export function getCachedResponse(cacheKey: string): OverpassResponse | null {
  if (!isCacheValid(cacheKey)) return null;
  return queryCache.get(cacheKey)?.data ?? null;
}

export function cacheResponse(cacheKey: string, data: OverpassResponse): void {
  if (!OSM_CONFIG.CACHE_ENABLED) return;
  
  queryCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

export async function executeOverpassQuery(query: string): Promise<OverpassResponse> {
  const urls = [OSM_CONFIG.API_URL, OSM_CONFIG.BACKUP_API_URL];
  
  logger.substep('Overpass Query', {
    query: query.trim(),
    primaryUrl: urls[0],
    backupUrl: urls[1],
    maxRetries: OSM_CONFIG.MAX_RETRIES,
  });
  
  for (let attempt = 0; attempt < OSM_CONFIG.MAX_RETRIES; attempt++) {
    for (const url of urls) {
      const callStartTime = Date.now();
      
      try {
        logger.debug('Overpass API Call', {
          attempt: attempt + 1,
          url,
          timeout: OSM_CONFIG.REQUEST_TIMEOUT_MS + ' ms',
        });
        
        const response = await fetchOverpass(url, query);
        const callDuration = Date.now() - callStartTime;
        
        logger.success('Overpass Response', {
          duration: callDuration + ' ms',
          url,
          elementCount: response.elements?.length ?? 0,
          remark: response.remark,
          sampleElements: response.elements?.slice(0, 3).map(el => ({
            type: el.type,
            id: el.id,
            tags: el.tags ? {
              highway: el.tags.highway,
              surface: el.tags.surface,
              smoothness: el.tags.smoothness,
              mtbScale: el.tags.mtbScale,
            } : null,
          })),
        });
        
        return response;
      } catch (error) {
        const callDuration = Date.now() - callStartTime;
        logger.warn('Overpass API Failed', error instanceof Error ? error.message : 'Unknown error', {
          attempt: attempt + 1,
          url,
          duration: callDuration + ' ms',
        });
        
        if (attempt === OSM_CONFIG.MAX_RETRIES - 1 && url === urls[urls.length - 1]) {
          throw new OsmClientError(
            `Overpass API failed after ${OSM_CONFIG.MAX_RETRIES} retries: ${error instanceof Error ? error.message : 'Unknown error'}`,
            undefined,
            false
          );
        }
        
        await new Promise(resolve => setTimeout(resolve, OSM_CONFIG.RETRY_DELAY_MS));
      }
    }
  }
  
  throw new OsmClientError('Overpass API query failed', undefined, false);
}

async function fetchOverpass(url: string, query: string): Promise<OverpassResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OSM_CONFIG.REQUEST_TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new OsmClientError(
        `Overpass API returned ${response.status}`,
        response.status,
        response.status >= 500 || response.status === 429
      );
    }
    
    const data = await response.json() as OverpassResponse;
    
    if (data.remark && data.remark.includes('error')) {
      throw new OsmClientError(`Overpass error: ${data.remark}`, undefined, true);
    }
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new OsmClientError('Overpass API request timed out', undefined, true);
    }
    
    throw error;
  }
}

export async function queryOsmWays(params: OverpassQueryParams): Promise<OverpassResponse> {
  const cacheKey = generateCacheKey(params);
  
  logger.substep('OSM Query', {
    bbox: params.bbox,
    cacheKey,
    cacheEnabled: OSM_CONFIG.CACHE_ENABLED,
  });
  
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    logger.success('OSM Cache Hit', {
      cacheKey,
      elementCount: cached.elements?.length ?? 0,
    });
    return cached;
  }
  
  logger.debug('OSM Cache Miss', { cacheKey });
  
  const query = buildOverpassQuery(params);
  const response = await executeOverpassQuery(query);
  
  cacheResponse(cacheKey, response);
  logger.debug('OSM Response Cached', { cacheKey });
  
  return response;
}

export function calculateBboxFromPoints(
  points: { lat: number; lon: number }[],
  paddingKm: number = 0.5
): OverpassQueryParams['bbox'] {
  if (points.length === 0) {
    throw new OsmClientError('Cannot calculate bbox from empty points array');
  }
  
  const lats = points.map(p => p.lat);
  const lons = points.map(p => p.lon);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  
  const latPadding = paddingKm / 111;
  const lonPadding = paddingKm / (111 * Math.cos((minLat + maxLat) / 2 * Math.PI / 180));
  
  return {
    south: minLat - latPadding,
    west: minLon - lonPadding,
    north: maxLat + latPadding,
    east: maxLon + lonPadding,
  };
}

export function validateBbox(bbox: OverpassQueryParams['bbox']): boolean {
  const latDiff = bbox.north - bbox.south;
  const lonDiff = bbox.east - bbox.west;
  
  const areaKm2 = latDiff * 111 * lonDiff * 111 * Math.cos(bbox.south * Math.PI / 180);
  
  return areaKm2 <= OSM_CONFIG.MAX_BBOX_AREA_KM2;
}

export function filterRelevantWays(elements: OverpassResponse['elements']): OsmWay[] {
  const relevantHighwayTypes = [
    'path', 'track', 'footway', 'cycleway', 'bridleway',
    'primary', 'secondary', 'tertiary', 'residential', 'service',
    'unclassified', 'mountain_bike',
  ];
  
  return elements.filter((el): el is OsmWay => {
    if (el.type !== 'way') return false;
    const highway = el.tags?.highway;
    return highway !== undefined && relevantHighwayTypes.includes(highway);
  });
}

export function clearCache(): void {
  queryCache.clear();
}