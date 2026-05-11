import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { analyzeRoutes } from './analyze.routes.js';

export function createApiRoutes(): Router {
  const router = Router();

  router.use('/health', healthRoutes());
  router.use('/api', analyzeRoutes());

  return router;
}