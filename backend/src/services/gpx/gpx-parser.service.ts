import GpxParser from 'gpxparser';
import type {
  ParsedGpx,
  ParsedTrack,
  ParsedTrackPoint,
  ParsedRoute,
} from './gpx.types.js';

export class GpxParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GpxParsingError';
  }
}

export function parseGpxContent(gpxContent: string): ParsedGpx {
  try {
    const gpx = new GpxParser();
    gpx.parse(gpxContent);

    const tracks: ParsedTrack[] = gpx.tracks.map((track) => ({
      name: track.name ?? 'Unnamed Track',
      segments: [{
        points: track.points.map((point) => ({
          latitude: point.lat,
          longitude: point.lon,
          elevation: point.ele ?? null,
          timestamp: point.time ? new Date(point.time) : null,
        })),
      }],
    }));

    const routes: ParsedRoute[] = gpx.routes.map((route) => ({
      name: route.name ?? 'Unnamed Route',
      points: route.points.map((point) => ({
        latitude: point.lat,
        longitude: point.lon,
        elevation: point.ele ?? null,
        timestamp: point.time ? new Date(point.time) : null,
      })),
    }));

    const waypoints: ParsedTrackPoint[] = gpx.waypoints.map((point) => ({
      latitude: point.lat,
      longitude: point.lon,
      elevation: point.ele ?? null,
      timestamp: point.time ? new Date(point.time) : null,
    }));

    const totalPoints =
      tracks.reduce((sum, t) => sum + t.segments.reduce((s, seg) => s + seg.points.length, 0), 0) +
      routes.reduce((sum, r) => sum + r.points.length, 0) +
      waypoints.length;

    return {
      name: gpx.metadata?.name ?? 'Unnamed GPX',
      tracks,
      routes,
      waypoints,
      totalPoints,
    };
  } catch (error) {
    throw new GpxParsingError(
      `Failed to parse GPX content: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export function getAllPoints(parsedGpx: ParsedGpx): ParsedTrackPoint[] {
  const points: ParsedTrackPoint[] = [];

  for (const track of parsedGpx.tracks) {
    for (const segment of track.segments) {
      points.push(...segment.points);
    }
  }

  for (const route of parsedGpx.routes) {
    points.push(...route.points);
  }

  return points;
}

export function getFirstTrack(parsedGpx: ParsedGpx): ParsedTrack | null {
  return parsedGpx.tracks[0] ?? null;
}

export function getFirstTrackPoints(parsedGpx: ParsedGpx): ParsedTrackPoint[] {
  const firstTrack = getFirstTrack(parsedGpx);
  if (!firstTrack || firstTrack.segments.length === 0) {
    if (parsedGpx.routes.length > 0) {
      return parsedGpx.routes[0]?.points ?? [];
    }
    return [];
  }
  const firstSegment = firstTrack.segments[0];
  return firstSegment?.points ?? [];
}