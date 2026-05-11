import { describe, it, expect } from 'vitest';
import { buildValidationPrompt } from '../../../src/services/ai/prompt-builder.service.js';
import type { AIContext } from '../../../src/services/ai/ai.types.js';

describe('Prompt Builder', () => {
  describe('buildValidationPrompt', () => {
    it('should generate prompt with all context', () => {
      const context: AIContext = {
        riderWeight: 82,
        bikeType: 'trail',
        tireWidth: 2.4,
        tubeless: true,
        ridingStyle: 'aggressive',
        terrainFlags: {
          rockyTerrain: true,
          wetRoots: false,
          fastFlowTrail: false,
          longGravelRide: false,
          technicalDescent: true,
        },
        routeMetrics: {
          totalDistance: 15,
          elevationGain: 500,
          elevationLoss: 400,
          maxGradient: 18,
          avgGradient: 10,
          difficultyRating: 'hard',
        },
        baselinePsi: { front: 22, rear: 25 },
        adjustedPsi: { front: 20, rear: 23 },
      };

      const prompt = buildValidationPrompt(context);

      expect(prompt).toContain('82 kg');
      expect(prompt).toContain('trail');
      expect(prompt).toContain('2.4');
      expect(prompt).toContain('Rocky terrain');
      expect(prompt).toContain('Technical descent');
      expect(prompt).toContain('22 PSI');
      expect(prompt).toContain('JSON');
    });

    it('should handle empty terrain flags', () => {
      const context: AIContext = {
        riderWeight: 75,
        bikeType: 'xc',
        tireWidth: 2.2,
        tubeless: false,
        ridingStyle: 'moderate',
        terrainFlags: {
          rockyTerrain: false,
          wetRoots: false,
          fastFlowTrail: false,
          longGravelRide: false,
          technicalDescent: false,
        },
        routeMetrics: {
          totalDistance: 10,
          elevationGain: 200,
          elevationLoss: 150,
          maxGradient: 8,
          avgGradient: 5,
          difficultyRating: 'easy',
        },
        baselinePsi: { front: 24, rear: 27 },
        adjustedPsi: { front: 24, rear: 27 },
      };

      const prompt = buildValidationPrompt(context);

      expect(prompt).toContain('No specific terrain flags');
    });
  });
});