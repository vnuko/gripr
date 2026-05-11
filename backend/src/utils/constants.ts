export const PSI_LIMITS = {
  MIN_FRONT: 12,
  MAX_FRONT: 35,
  MIN_REAR: 15,
  MAX_REAR: 40,
} as const;

export const TERRAIN_MODIFIERS = {
  ROCKY_TERRAIN: -2,
  WET_ROOTS: -1,
  FAST_FLOW_TRAIL: 1,
  LONG_GRAVEL_RIDE: 1,
  TECHNICAL_DESCENT: -2,
} as const;

export const RIDER_WEIGHT_ADJUSTMENTS = {
  LIGHT: { min: 0, max: 65, adjustment: -2 },
  MEDIUM: { min: 65, max: 85, adjustment: 0 },
  HEAVY: { min: 85, max: 100, adjustment: 2 },
  VERY_HEAVY: { min: 100, max: Infinity, adjustment: 4 },
} as const;

export const TIRE_WIDTH_ADJUSTMENTS = {
  NARROW: { min: 0, max: 2.0, adjustment: 3 },
  MEDIUM: { min: 2.0, max: 2.5, adjustment: 0 },
  WIDE: { min: 2.5, max: Infinity, adjustment: -2 },
} as const;

export const BIKE_TYPE_BASELINES = {
  trail: { frontBase: 22, rearBase: 25 },
  enduro: { frontBase: 20, rearBase: 23 },
  xc: { frontBase: 24, rearBase: 27 },
  downhill: { frontBase: 18, rearBase: 21 },
  gravel: { frontBase: 28, rearBase: 32 },
} as const;

export const RIDING_STYLE_MODIFIERS = {
  conservative: -1,
  moderate: 0,
  aggressive: 1,
} as const;

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_EXTENSIONS: ['.gpx'],
} as const;

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type SurfaceType = 'asphalt' | 'gravel' | 'dirt' | 'rocky' | 'technical';

export const SURFACE_TYPE_MODIFIERS = {
  asphalt: +1.0,
  gravel: +0.5,
  dirt: -0.5,
  rocky: -2.0,
  technical: -2.0,
} as const;

export const OSM_SURFACE_MAPPING: Record<string, SurfaceType> = {
  asphalt: 'asphalt',
  paved: 'asphalt',
  concrete: 'asphalt',
  paving_stones: 'asphalt',
  sett: 'asphalt',
  cobblestone: 'asphalt',
  gravel: 'gravel',
  fine_gravel: 'gravel',
  compacted: 'gravel',
  dirt: 'dirt',
  ground: 'dirt',
  earth: 'dirt',
  unpaved: 'dirt',
  grass: 'dirt',
  sand: 'dirt',
  rock: 'rocky',
  stone: 'rocky',
  pebblestone: 'rocky',
  unknown: 'dirt',
} as const;

export const OSM_HIGHWAY_MAPPING: Record<string, SurfaceType> = {
  primary: 'asphalt',
  secondary: 'asphalt',
  tertiary: 'asphalt',
  residential: 'asphalt',
  service: 'asphalt',
  cycleway: 'asphalt',
  path: 'dirt',
  track: 'gravel',
  footway: 'dirt',
  bridleway: 'dirt',
  mountain_bike: 'technical',
  unclassified: 'gravel',
} as const;

export const MTB_SCALE_MAPPING: Record<string, SurfaceType> = {
  '0': 'dirt',
  '1': 'dirt',
  '2': 'gravel',
  '3': 'technical',
  '4': 'technical',
  '5': 'technical',
  '6': 'technical',
} as const;

export const OSM_SMOOTHNESS_MAPPING: Record<string, { surface: SurfaceType; roughness: number }> = {
  excellent: { surface: 'asphalt', roughness: 0.1 },
  good: { surface: 'asphalt', roughness: 0.2 },
  intermediate: { surface: 'gravel', roughness: 0.4 },
  bad: { surface: 'dirt', roughness: 0.6 },
  very_bad: { surface: 'technical', roughness: 0.8 },
  horrible: { surface: 'technical', roughness: 0.9 },
  very_horrible: { surface: 'technical', roughness: 1.0 },
} as const;

export const OSM_CONFIG = {
  API_URL: 'https://overpass-api.de/api/interpreter',
  BACKUP_API_URL: 'https://overpass.kumi.wegs/api/interpreter',
  REQUEST_TIMEOUT_MS: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  CACHE_ENABLED: true,
  CACHE_TTL_SECONDS: 3600,
  MAX_BBOX_AREA_KM2: 100,
  MAX_POINTS_PER_QUERY: 500,
} as const;

export const SEGMENTATION_CONFIG = {
  MIN_SEGMENT_LENGTH_M: 50,
  MAX_SEGMENT_LENGTH_M: 200,
  ADAPTIVE_THRESHOLD_M: 100,
  MIN_POINTS_PER_SEGMENT: 3,
} as const;

export const TERRAIN_SCORE_WEIGHTS = {
  roughness: {
    mtbScale: 0.4,
    smoothness: 0.3,
    surfaceVariance: 0.3,
  },
  technicality: {
    gradient: 0.3,
    mtbScale: 0.4,
    directionChanges: 0.3,
  },
  flow: {
    gradientConsistency: 0.5,
    segmentLengthConsistency: 0.3,
    smoothness: 0.2,
  },
} as const;

export const MATCHING_CONFIG = {
  MAX_SNAP_DISTANCE_M: 30,
  HIGH_CONFIDENCE_THRESHOLD_M: 10,
  MEDIUM_CONFIDENCE_THRESHOLD_M: 20,
  MIN_MATCH_RATE_FOR_OSM: 0.5,
} as const;