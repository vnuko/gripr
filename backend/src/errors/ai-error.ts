import { AppError } from './app-error.js';

export class AIError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 503, 'ai_error', details);
  }
}

export function createAIError(message: string, details?: Record<string, unknown>): AIError {
  return new AIError(message, details);
}

export function aiServiceUnavailable(originalError?: Error): AIError {
  return new AIError('AI service temporarily unavailable', {
    reason: originalError?.message ?? 'Unknown',
  });
}

export function aiResponseInvalid(response: string): AIError {
  return new AIError('Invalid AI response format', { response });
}