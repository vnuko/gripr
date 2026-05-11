import { describe, it, expect } from 'vitest';
import {
  OSM_SURFACE_MAPPING,
  OSM_HIGHWAY_MAPPING,
  MTB_SCALE_MAPPING,
  SURFACE_TYPE_MODIFIERS,
} from '../../../src/utils/constants.js';
import type { SurfaceType, TerrainComposition } from '../../../src/services/osm/osm.types.js';

describe('OSM Types and Constants', () => {
  describe('OSM_SURFACE_MAPPING', () => {
    it('should map asphalt surfaces correctly', () => {
      expect(OSM_SURFACE_MAPPING.asphalt).toBe('asphalt');
      expect(OSM_SURFACE_MAPPING.paved).toBe('asphalt');
      expect(OSM_SURFACE_MAPPING.concrete).toBe('asphalt');
    });

    it('should map gravel surfaces correctly', () => {
      expect(OSM_SURFACE_MAPPING.gravel).toBe('gravel');
      expect(OSM_SURFACE_MAPPING.fine_gravel).toBe('gravel');
      expect(OSM_SURFACE_MAPPING.compacted).toBe('gravel');
    });

    it('should map dirt surfaces correctly', () => {
      expect(OSM_SURFACE_MAPPING.dirt).toBe('dirt');
      expect(OSM_SURFACE_MAPPING.ground).toBe('dirt');
      expect(OSM_SURFACE_MAPPING.unpaved).toBe('dirt');
    });

    it('should map rocky surfaces correctly', () => {
      expect(OSM_SURFACE_MAPPING.rock).toBe('rocky');
      expect(OSM_SURFACE_MAPPING.stone).toBe('rocky');
    });

    it('should have fallback for unknown', () => {
      expect(OSM_SURFACE_MAPPING.unknown).toBe('dirt');
    });
  });

  describe('OSM_HIGHWAY_MAPPING', () => {
    it('should map paved road types to asphalt', () => {
      expect(OSM_HIGHWAY_MAPPING.primary).toBe('asphalt');
      expect(OSM_HIGHWAY_MAPPING.secondary).toBe('asphalt');
      expect(OSM_HIGHWAY_MAPPING.residential).toBe('asphalt');
    });

    it('should map track to gravel', () => {
      expect(OSM_HIGHWAY_MAPPING.track).toBe('gravel');
    });

    it('should map path and footway to dirt', () => {
      expect(OSM_HIGHWAY_MAPPING.path).toBe('dirt');
      expect(OSM_HIGHWAY_MAPPING.footway).toBe('dirt');
    });
  });

  describe('MTB_SCALE_MAPPING', () => {
    it('should map easy MTB scales to dirt', () => {
      expect(MTB_SCALE_MAPPING['0']).toBe('dirt');
      expect(MTB_SCALE_MAPPING['1']).toBe('dirt');
    });

    it('should map medium MTB scales to gravel', () => {
      expect(MTB_SCALE_MAPPING['2']).toBe('gravel');
    });

    it('should map difficult MTB scales to technical', () => {
      expect(MTB_SCALE_MAPPING['3']).toBe('technical');
      expect(MTB_SCALE_MAPPING['4']).toBe('technical');
      expect(MTB_SCALE_MAPPING['5']).toBe('technical');
    });
  });

  describe('SURFACE_TYPE_MODIFIERS', () => {
    it('should have positive modifiers for smooth surfaces', () => {
      expect(SURFACE_TYPE_MODIFIERS.asphalt).toBeGreaterThan(0);
      expect(SURFACE_TYPE_MODIFIERS.gravel).toBeGreaterThan(0);
    });

    it('should have negative modifiers for rough surfaces', () => {
      expect(SURFACE_TYPE_MODIFIERS.dirt).toBeLessThan(0);
      expect(SURFACE_TYPE_MODIFIERS.rocky).toBeLessThan(0);
      expect(SURFACE_TYPE_MODIFIERS.technical).toBeLessThan(0);
    });
  });

  describe('TerrainComposition validation', () => {
    it('should sum to 1.0 for valid composition', () => {
      const composition: TerrainComposition = {
        asphalt: 0.1,
        gravel: 0.4,
        dirt: 0.2,
        rocky: 0.2,
        technical: 0.1,
      };

      const sum = Object.values(composition).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 5);
    });

    it('should allow zero values for unused surfaces', () => {
      const composition: TerrainComposition = {
        asphalt: 0.0,
        gravel: 1.0,
        dirt: 0.0,
        rocky: 0.0,
        technical: 0.0,
      };

      expect(composition.asphalt).toBe(0);
      expect(composition.gravel).toBe(1);
    });
  });
});