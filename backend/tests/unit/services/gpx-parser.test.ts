import { describe, it, expect } from 'vitest';
import { parseGpxContent, getAllPoints, getFirstTrackPoints } from '../../../src/services/gpx/gpx-parser.service.js';

describe('GPX Parser Service', () => {
  describe('parseGpxContent', () => {
    it('should parse valid GPX with tracks', () => {
      const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
          <trk>
            <name>Test Track</name>
            <trkseg>
              <trkpt lat="47.3769" lon="8.5417"><ele>450</ele></trkpt>
              <trkpt lat="47.3770" lon="8.5418"><ele>455</ele></trkpt>
            </trkseg>
          </trk>
        </gpx>`;

      const result = parseGpxContent(gpxContent);

      expect(result.tracks).toHaveLength(1);
      expect(result.tracks[0].name).toBe('Test Track');
      expect(result.tracks[0].segments).toHaveLength(1);
      expect(result.tracks[0].segments[0].points).toHaveLength(2);
      expect(result.totalPoints).toBe(2);
    });

    it('should parse GPX combining multiple segments into one', () => {
      const gpxContent = `<?xml version="1.0"?>
        <gpx version="1.1">
          <trk>
            <trkseg>
              <trkpt lat="47.0" lon="8.0"><ele>100</ele></trkpt>
            </trkseg>
            <trkseg>
              <trkpt lat="47.1" lon="8.1"><ele>200</ele></trkpt>
            </trkseg>
          </trk>
        </gpx>`;

      const result = parseGpxContent(gpxContent);

      expect(result.tracks[0].segments).toHaveLength(1);
      expect(result.tracks[0].segments[0].points).toHaveLength(2);
      expect(result.totalPoints).toBe(2);
    });

    it('should parse GPX with routes', () => {
      const gpxContent = `<?xml version="1.0"?>
        <gpx version="1.1">
          <rte>
            <name>Test Route</name>
            <rtept lat="47.0" lon="8.0"><ele>100</ele></rtept>
          </rte>
        </gpx>`;

      const result = parseGpxContent(gpxContent);

      expect(result.routes).toHaveLength(1);
      expect(result.routes[0].name).toBe('Test Route');
      expect(result.routes[0].points).toHaveLength(1);
    });

    it('should handle missing elevation', () => {
      const gpxContent = `<?xml version="1.0"?>
        <gpx version="1.1">
          <trk>
            <trkseg>
              <trkpt lat="47.0" lon="8.0"/>
            </trkseg>
          </trk>
        </gpx>`;

      const result = parseGpxContent(gpxContent);

      expect(result.tracks[0].segments[0].points[0].elevation).toBeNull();
    });

    it('should handle invalid GPX gracefully', () => {
      const invalidContent = 'not valid gpx';

      const result = parseGpxContent(invalidContent);

      expect(result.tracks).toHaveLength(0);
      expect(result.routes).toHaveLength(0);
      expect(result.totalPoints).toBe(0);
    });
  });

  describe('getAllPoints', () => {
    it('should aggregate all track points', () => {
      const gpxContent = `<?xml version="1.0"?>
        <gpx version="1.1">
          <trk>
            <trkseg>
              <trkpt lat="47.0" lon="8.0"></trkpt>
              <trkpt lat="47.1" lon="8.1"></trkpt>
            </trkseg>
          </trk>
          <rte>
            <rtept lat="48.0" lon="9.0"></rtept>
          </rte>
        </gpx>`;

      const parsed = parseGpxContent(gpxContent);
      const allPoints = getAllPoints(parsed);

      expect(allPoints).toHaveLength(3);
    });
  });

  describe('getFirstTrackPoints', () => {
    it('should return first track first segment points', () => {
      const gpxContent = `<?xml version="1.0"?>
        <gpx version="1.1">
          <trk>
            <trkseg>
              <trkpt lat="47.0" lon="8.0"></trkpt>
            </trkseg>
          </trk>
        </gpx>`;

      const parsed = parseGpxContent(gpxContent);
      const points = getFirstTrackPoints(parsed);

      expect(points).toHaveLength(1);
      expect(points[0].latitude).toBe(47.0);
    });

    it('should return empty array for GPX with no tracks or routes', () => {
      const gpxContent = `<?xml version="1.0"?>
        <gpx version="1.1">
        </gpx>`;

      const parsed = parseGpxContent(gpxContent);
      const points = getFirstTrackPoints(parsed);

      expect(points).toHaveLength(0);
    });
  });
});