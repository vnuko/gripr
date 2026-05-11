import OpenAI from 'openai';
import { getEnvConfig } from '../../types/env.types.js';
import { PSI_LIMITS } from '../../utils/constants.js';
import type { AIContextV2, AIContext, AIRecommendation, AIResponse, OpenAIConfig } from './ai.types.js';
import { buildValidationPrompt, buildPromptV2 } from './prompt-builder.service.js';

export class OpenAIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIError';
  }
}

function createOpenAIClient(): OpenAI {
  const config = getEnvConfig();

  return new OpenAI({
    apiKey: config.OPENAI_API_KEY,
  });
}

export async function callOpenAI(
  context: AIContextV2 | AIContext,
  config?: Partial<OpenAIConfig>
): Promise<AIResponse> {
  try {
    const envConfig = getEnvConfig();
    const openai = createOpenAIClient();

    const prompt = 'terrainProfile' in context
      ? buildPromptV2(context as AIContextV2)
      : buildValidationPrompt(context as AIContext);

    const completion = await openai.chat.completions.create({
      model: config?.model ?? envConfig.OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a tire pressure expert. Respond only with valid JSON matching the specified format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: config?.maxTokens ?? envConfig.OPENAI_MAX_TOKENS,
      temperature: config?.temperature ?? envConfig.OPENAI_TEMPERATURE,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new OpenAIError('No response content from OpenAI');
    }

    const parsed = parseAIResponse(content);
    const validated = validateAIRecommendation(parsed, context.adjustedPsi);

    return {
      success: true,
      recommendation: validated,
    };
  } catch (error) {
    console.error('[OpenAI Error]', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallbackUsed: true,
    };
  }
}

function parseAIResponse(content: string): AIRecommendation {
  try {
    const parsed = JSON.parse(content);

    const result: AIRecommendation = {
      frontPsi: Number(parsed.frontPsi),
      rearPsi: Number(parsed.rearPsi),
      reasoning: String(parsed.reasoning ?? ''),
      confidence: (parsed.confidence as AIRecommendation['confidence']) ?? 'medium',
    };

    if (parsed.warnings && Array.isArray(parsed.warnings)) {
      result.warnings = parsed.warnings.map(String);
    }

    return result;
  } catch {
    throw new OpenAIError(`Failed to parse AI response: ${content}`);
  }
}

function validateAIRecommendation(
  recommendation: AIRecommendation,
  originalAdjusted: { front: number; rear: number }
): AIRecommendation {
  let frontPsi = recommendation.frontPsi;
  let rearPsi = recommendation.rearPsi;

  frontPsi = Math.max(PSI_LIMITS.MIN_FRONT, Math.min(PSI_LIMITS.MAX_FRONT, frontPsi));
  rearPsi = Math.max(PSI_LIMITS.MIN_REAR, Math.min(PSI_LIMITS.MAX_REAR, rearPsi));

  const maxAdjustment = 2;
  frontPsi = clampAdjustment(frontPsi, originalAdjusted.front, maxAdjustment);
  rearPsi = clampAdjustment(rearPsi, originalAdjusted.rear, maxAdjustment);

  const warnings: string[] = recommendation.warnings ? [...recommendation.warnings] : [];

  if (frontPsi !== recommendation.frontPsi || rearPsi !== recommendation.rearPsi) {
    warnings.push('AI recommendation was adjusted to stay within safe limits');
  }

  const result: AIRecommendation = {
    frontPsi: Math.round(frontPsi),
    rearPsi: Math.round(rearPsi),
    reasoning: recommendation.reasoning,
    confidence: recommendation.confidence,
  };

  if (warnings.length > 0) {
    result.warnings = warnings;
  }

  return result;
}

function clampAdjustment(value: number, baseline: number, maxDelta: number): number {
  const delta = value - baseline;
  const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, delta));
  return baseline + clampedDelta;
}

export function createFallbackRecommendation(
  adjustedPsi: { front: number; rear: number }
): AIRecommendation {
  return {
    frontPsi: adjustedPsi.front,
    rearPsi: adjustedPsi.rear,
    reasoning:
      'Using calculated pressure values (AI validation unavailable). These values are based on rider weight, bike type, tire width, and terrain analysis.',
    confidence: 'medium',
    warnings: ['AI validation was not available - using deterministic calculation only'],
  };
}