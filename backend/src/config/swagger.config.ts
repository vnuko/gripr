import type { SwaggerUiOptions } from 'swagger-ui-express';

export const swaggerUiOptions: SwaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
};

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Gripr - Bike Tire Pressure Recommendation API',
    version: '1.0.0',
    description:
      'AI-powered bike tire pressure recommendation system based on GPX route analysis, rider information, and terrain characteristics.',
    contact: {
      name: 'API Support',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'http://localhost:3001',
      description: 'Test server',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Analysis',
      description: 'Tire pressure analysis endpoints',
    },
  ],
  paths: {},
  components: {
    schemas: {},
    responses: {},
    parameters: {},
  },
};

export const swaggerJsdocOptions = {
  definition: openApiSpec,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/schemas/*.ts',
  ],
};