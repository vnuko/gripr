import type { AIContext, AIResponse, AIRecommendation } from '../../src/services/ai/ai.types.js';

export function mockOpenAISuccessResponse(
  recommendation: Partial<AIRecommendation>
): AIResponse {
  return {
    success: true,
    recommendation: {
      frontPsi: recommendation.frontPsi ?? 21,
      rearPsi: recommendation.rearPsi ?? 24,
      reasoning: recommendation.reasoning ?? 'Mock AI reasoning',
      confidence: recommendation.confidence ?? 'high',
    },
  };
}

export function mockOpenAIErrorResponse(): AIResponse {
  return {
    success: false,
    error: 'Mock error',
    fallbackUsed: true,
  };
}

export function createMockOpenAIResponse(context: AIContext): AIRecommendation {
  const baseFront = context.adjustedPsi.front;
  const baseRear = context.adjustedPsi.rear;

  let reasoning = 'Validated pressure recommendation based on rider profile and terrain.';

  if (context.terrainFlags.rockyTerrain) {
    reasoning += ' Rocky terrain suggests slightly lower pressure for grip and puncture protection.';
  }

  if (context.terrainFlags.wetRoots) {
    reasoning += ' Wet roots require careful pressure balance for traction.';
  }

  if (context.tubeless) {
    reasoning += ' Tubeless setup allows slightly lower pressure for better traction.';
  }

  return {
    frontPsi: Math.round(baseFront - 0.5),
    rearPsi: Math.round(baseRear - 0.5),
    reasoning,
    confidence: 'high',
  };
}