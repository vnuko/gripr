import { config } from 'dotenv';

config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.OPENAI_API_KEY = 'test-key';
process.env.OPENAI_MODEL = 'gpt-4.1-mini';