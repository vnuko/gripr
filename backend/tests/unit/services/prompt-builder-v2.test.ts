import { describe, it, expect } from 'vitest';
import { buildPromptV2 } from '../../../src/services/ai/prompt-builder.service.js';
import type { AIContextV2 } from '../../../src/services/ai/ai.types.js';
import type { TerrainProfile } from '../../../src/services/terrain/terrain.types.js';

describe('Prompt Builder V2', () => {
  describe('buildPromptV2', () => {
    it('should include terrain composition in prompt', () => {
      const terrainProfile: TerrainProfile = {
        composition: {
          asphalt: 0.1,
          gravel: 0.4,
          dirt: 0.2,
          rocky: 0.2,
          technical: 0.1,
        },
        scores: { roughness: 0.5, technicality: 0.3, flow: 0.4 },
        osmEnrichmentStatus: {
          osmAvailable: true,
          segmentsProcessed: 100,
          segmentsWithOsmData: 80,
          fallbackSegments: 20,
        },
      };

      const context: AIContextV2 = {
        riderWeight: 82,
        bikeType: 'trail',
        tireWidth: 2.4,
        tubeless: true,
        ridingStyle: 'aggressive',
        terrainProfile,
        baselinePsi: { front: 22, rear: 25 },
        adjustedPsi: { front: 21, rear: 24 },
        inputMode: 'gpx',
      };

      const prompt = buildPromptV2(context);

      expect(prompt).toContain('Asphalt: 10%');
      expect(prompt).toContain('Gravel: 40%');
      expect(prompt).toContain('Rocky: 20%');
      expect(prompt).toContain('Roughness: 50%');
      expect(prompt).toContain('OpenStreetMap enriched');
    });

    it('should indicate manual input mode', () => {
      const terrainProfile: TerrainProfile = {
        composition: {
          gravel: 0.7,
          rocky: 0.3,
          asphalt: 0,
          dirt: 0,
          technical: 0,
        },
        scores: { roughness: 0.6, technicality: 0.3, flow: 0.35 },
        osmEnrichmentStatus: {
          osmAvailable: false,
          segmentsProcessed: 0,
          segmentsWithOsmData: 0,
          fallbackSegments: 0,
          fallbackMode: 'manual',
        },
      };

      const context: AIContextV2 = {
        riderWeight: 75,
        bikeType: 'enduro',
        tireWidth: 2.5,
        tubeless: true,
        ridingStyle: 'aggressive',
        terrainProfile,
        baselinePsi: { front: 20, rear: 23 },
        adjustedPsi: { front: 19, rear: 22 },
        inputMode: 'manual',
      };

      const prompt = buildPromptV2(context);

      expect(prompt).toContain('manually specified terrain composition');
    });

    it('should include rider profile information', () => {
      const context: AIContextV2 = {
        riderWeight: 90,
        bikeType: 'downhill',
        tireWidth: 2.6,
        tubeless: true,
        ridingStyle: 'aggressive',
        terrainProfile: {
          composition: { rocky: 1, asphalt: 0, gravel: 0, dirt: 0, technical: 0 },
          scores: { roughness: 0.8, technicality: 0.7, flow: 0.2 },
        },
        baselinePsi: { front: 18, rear: 21 },
        adjustedPsi: { front: 16, rear: 19 },
        inputMode: 'gpx',
      };

      const prompt = buildPromptV2(context);

      expect(prompt).toContain('Weight: 90 kg');
      expect(prompt).toContain('Bike Type: downhill');
      expect(prompt).toContain('Tire Width: 2.6 inches');
    });
  });
});