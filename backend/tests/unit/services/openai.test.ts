import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFallbackRecommendation } from '../../../src/services/ai/openai.service.js';

vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    frontPsi: 21,
                    rearPsi: 24,
                    reasoning: 'Mock reasoning',
                    confidence: 'high',
                  }),
                },
              },
            ],
          }),
        },
      },
    })),
  };
});

describe('OpenAI Service', () => {
  describe('createFallbackRecommendation', () => {
    it('should create fallback with adjusted values', () => {
      const adjusted = { front: 20, rear: 23 };

      const result = createFallbackRecommendation(adjusted);

      expect(result.frontPsi).toBe(20);
      expect(result.rearPsi).toBe(23);
      expect(result.confidence).toBe('medium');
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.length).toBeGreaterThan(0);
    });

    it('should include appropriate reasoning', () => {
      const adjusted = { front: 22, rear: 25 };

      const result = createFallbackRecommendation(adjusted);

      expect(result.reasoning).toContain('calculated');
    });
  });
});