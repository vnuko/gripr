export interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'test' | 'production';
  CORS_ORIGINS: string[];
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_MAX_TOKENS: number;
  OPENAI_TEMPERATURE: number;
}

export function getEnvConfig(): EnvConfig {
  return {
    PORT: parseInt(process.env.PORT ?? '3000', 10),
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) ?? 'development',
    CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean) ?? [],
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
    OPENAI_MODEL: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
    OPENAI_MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS ?? '500', 10),
    OPENAI_TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE ?? '0.3'),
  };
}