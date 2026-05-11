import { Router } from 'express';
import { gpxUpload } from '../middleware/upload.middleware.js';
import { analyzeHandler } from '../controllers/analyze.controller.js';

/**
 * @openapi
 * /api/analyze:
 *   post:
 *     summary: Analyze route and recommend tire pressure
 *     description: |
 *       Two modes supported:
 *       1. GPX Upload: Upload GPX file with rider info for OSM-enriched analysis
 *       2. Manual Terrain: Provide terrain percentages without GPX
 *     tags:
 *       - Analysis
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - riderWeight
 *               - bikeType
 *               - tireWidth
 *               - tubeless
 *               - ridingStyle
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: GPX file (optional if manualTerrain provided)
 *               riderWeight:
 *                 type: number
 *                 description: Rider weight in kg
 *               bikeType:
 *                 type: string
 *                 enum: [trail, enduro, xc, downhill, gravel]
 *               tireWidth:
 *                 type: number
 *                 description: Tire width in inches
 *               tubeless:
 *                 type: boolean
 *               ridingStyle:
 *                 type: string
 *                 enum: [conservative, moderate, aggressive]
 *               manualTerrain:
 *                 type: object
 *                 description: Terrain percentages (alternative to GPX)
 *                 properties:
 *                   asphalt:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 1
 *                   gravel:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 1
 *                   dirt:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 1
 *                   rocky:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 1
 *                   technical:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 1
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - riderWeight
 *               - bikeType
 *               - tireWidth
 *               - tubeless
 *               - ridingStyle
 *               - manualTerrain
 *             properties:
 *               riderWeight:
 *                 type: number
 *               bikeType:
 *                 type: string
 *                 enum: [trail, enduro, xc, downhill, gravel]
 *               tireWidth:
 *                 type: number
 *               tubeless:
 *                 type: boolean
 *               ridingStyle:
 *                 type: string
 *                 enum: [conservative, moderate, aggressive]
 *               manualTerrain:
 *                 type: object
 *                 description: Terrain percentages (required when no GPX)
 *     responses:
 *       200:
 *         description: Successful analysis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyzeResponseV2'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export function analyzeRoutes(): Router {
  const router = Router();

  router.post('/analyze', gpxUpload, analyzeHandler);

  return router;
}