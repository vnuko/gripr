export interface ParsedTrackPoint {
  latitude: number;
  longitude: number;
  elevation: number | null;
  timestamp: Date | null;
}

export interface ParsedSegment {
  points: ParsedTrackPoint[];
}

export interface ParsedTrack {
  name: string;
  segments: ParsedSegment[];
}

export interface ParsedRoute {
  name: string;
  points: ParsedTrackPoint[];
}

export interface ParsedGpx {
  name: string;
  tracks: ParsedTrack[];
  routes: ParsedRoute[];
  waypoints: ParsedTrackPoint[];
  totalPoints: number;
}

export interface ElevationProfile {
  elevations: number[];
  distances: number[];
  gradients: number[];
}

export interface DistanceCalculation {
  totalDistance: number;
  segmentDistances: number[];
}

export interface GradeSegment {
  distance: number;
  grade: number;
  type: 'climb' | 'descent' | 'flat';
}