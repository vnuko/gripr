import { XMLParser } from 'fast-xml-parser';
import logger from '../../utils/logger.js';
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

type XmlNode = Record<string, unknown>;

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toTimestamp(value: unknown): Date | null {
  if (typeof value !== 'string') {
    return null;
  }

  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
}

function parsePoint(node: unknown): ParsedTrackPoint | null {
  if (!node || typeof node !== 'object') {
    return null;
  }

  const point = node as XmlNode;
  const latitude = toNumber(point['@_lat']);
  const longitude = toNumber(point['@_lon']);

  if (latitude === null || longitude === null) {
    return null;
  }

  return {
    latitude,
    longitude,
    elevation: toNumber(point.ele),
    timestamp: toTimestamp(point.time),
  };
}

function parsePoints(nodes: unknown): ParsedTrackPoint[] {
  return asArray(nodes)
    .map(parsePoint)
    .filter((point): point is ParsedTrackPoint => point !== null);
}

function parseTracks(gpx: XmlNode): ParsedTrack[] {
  const rawTracks = asArray(gpx.trk);

  return rawTracks
    .filter((track): track is XmlNode => !!track && typeof track === 'object')
    .map((track) => {
      const segments = asArray(track.trkseg)
        .filter((segment): segment is XmlNode => !!segment && typeof segment === 'object')
        .flatMap((segment) => parsePoints(segment.trkpt));

      return {
        name: typeof track.name === 'string' ? track.name : 'Unnamed Track',
        segments: [{ points: segments }],
      };
    });
}

function parseRoutes(gpx: XmlNode): ParsedRoute[] {
  const rawRoutes = asArray(gpx.rte);

  return rawRoutes
    .filter((route): route is XmlNode => !!route && typeof route === 'object')
    .map((route) => ({
      name: typeof route.name === 'string' ? route.name : 'Unnamed Route',
      points: parsePoints(route.rtept),
    }));
}

function parseWaypoints(gpx: XmlNode): ParsedTrackPoint[] {
  return parsePoints(gpx.wpt);
}

export function parseGpxContent(gpxContent: string): ParsedGpx {
  const parseStartTime = Date.now();
  
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      removeNSPrefix: true,
      parseTagValue: true,
      trimValues: true,
    });

    const parsedXml = parser.parse(gpxContent) as XmlNode;
    const gpx = parsedXml.gpx;

    if (!gpx || typeof gpx !== 'object') {
      return {
        name: 'Unnamed GPX',
        tracks: [],
        routes: [],
        waypoints: [],
        totalPoints: 0,
      };
    }

    const gpxNode = gpx as XmlNode;
    const tracks = parseTracks(gpxNode);
    const routes = parseRoutes(gpxNode);
    const waypoints = parseWaypoints(gpxNode);

    const totalPoints =
      tracks.reduce((sum, t) => sum + t.segments.reduce((s, seg) => s + seg.points.length, 0), 0) +
      routes.reduce((sum, r) => sum + r.points.length, 0) +
      waypoints.length;

    const result: ParsedGpx = {
      name:
        gpxNode.metadata && typeof gpxNode.metadata === 'object' && typeof (gpxNode.metadata as XmlNode).name === 'string'
          ? (gpxNode.metadata as XmlNode).name as string
          : 'Unnamed GPX',
      tracks,
      routes,
      waypoints,
      totalPoints,
    };
    
    const parseDuration = Date.now() - parseStartTime;
    logger.substep('GPX Parsing Complete', {
      duration: parseDuration + ' ms',
      name: result.name,
      trackCount: tracks.length,
      routeCount: routes.length,
      waypointCount: waypoints.length,
      totalPoints: totalPoints,
      inputLength: gpxContent.length + ' bytes',
      firstTrackName: tracks[0]?.name ?? 'N/A',
      firstTrackPoints: tracks[0]?.segments[0]?.points.length ?? 0,
    });

    return result;
  } catch (error) {
    logger.error('GPX Parsing Failed', error instanceof Error ? error : new Error('Unknown error'), {
      inputLength: gpxContent.length,
      inputPreview: gpxContent.substring(0, 200),
    });
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
