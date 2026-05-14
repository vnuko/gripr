import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createApiRoutes } from './routes/index.js';
import { swaggerJsdocOptions, swaggerUiOptions } from './config/swagger.config.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { getEnvConfig } from './types/env.types.js';

config();

export function createApp(): express.Application {
  const app = express();
  const envConfig = getEnvConfig();

  app.use(cors({
    origin: envConfig.CORS_ORIGINS,
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(createApiRoutes());

  const specs = swaggerJsdoc(swaggerJsdocOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
  app.get('/openapi.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}