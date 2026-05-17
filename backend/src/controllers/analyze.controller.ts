import { Request, Response, NextFunction } from 'express';
import { validateGpxFile, extractGpxContent } from '../validators/gpx.validator.js';
import { validateRiderInputV2 } from '../validators/analyze.validator.js';
import { parseGpxContent, analyzeRoute } from '../services/gpx/index.js';
import { getFirstTrackPoints } from '../services/gpx/gpx-parser.service.js';
import { enrichRouteWithOsm } from '../services/osm/index.js';
import {
  segmentRoute,
  buildTerrainProfile,
  buildManualTerrainProfile,
} from '../services/terrain/index.js';
import { calculateFullPressureResultV2 } from '../services/pressure/index.js';
import { callOpenAI, createFallbackRecommendation } from '../services/ai/index.js';
import { fromZodError } from '../errors/validation-error.js';
import { gpxFileMissing, gpxInvalidFormat, gpxParseFailure } from '../errors/gpx-error.js';
import type { AnalyzeResponseV2, InputMode } from '../types/analyze.types.js';
import type { TerrainProfile } from '../services/terrain/terrain.types.js';
import logger from '../utils/logger.js';

export interface AnalyzeRequestWithFile extends Request {
  file?: Express.Multer.File;
}

export async function analyzeHandlerV2(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  logger.setRequestId();
  const startTime = Date.now();
  
  try {
    logger.debug('Input Validation', {
      riderWeight: req.body.riderWeight,
      bikeType: req.body.bikeType,
      tireWidth: req.body.tireWidth,
      tubeless: req.body.tubeless,
      ridingStyle: req.body.ridingStyle,
      skillLevel: req.body.skillLevel,
      manualTerrain: req.body.manualTerrain,
      hasGpxFile: !!req.file,
      gpxFileName: req.file?.originalname,
      gpxFileSize: req.file?.size,
    });
    
    const inputValidation = validateRiderInputV2({
      riderWeight: req.body.riderWeight,
      bikeType: req.body.bikeType,
      tireWidth: req.body.tireWidth,
      tubeless: req.body.tubeless,
      ridingStyle: req.body.ridingStyle,
      skillLevel: req.body.skillLevel,
      manualTerrain: req.body.manualTerrain,
    });

    if (!inputValidation.success) {
      throw fromZodError(inputValidation.error);
    }

    const riderInput = inputValidation.data;
    logger.success('Input Validated', {
      riderWeight: riderInput.riderWeight,
      bikeType: riderInput.bikeType,
      tireWidth: riderInput.tireWidth,
      tubeless: riderInput.tubeless,
      ridingStyle: riderInput.ridingStyle,
      skillLevel: riderInput.skillLevel,
    });

    const hasGpx = !!req.file;
    const hasManualTerrain = !!riderInput.manualTerrain;

    let inputMode: InputMode;
    let terrainProfile: TerrainProfile;
    let routeMetrics: any = undefined;

    if (hasGpx) {
      inputMode = 'gpx';
      logger.debug('GPX Processing', { mode: 'gpx' });
      
      const fileValidation = validateGpxFile(req.file);
      if (!fileValidation.valid) {
        if (fileValidation.error === 'No GPX file provided') {
          throw gpxFileMissing();
        }
        throw gpxInvalidFormat();
      }

      const gpxContent = extractGpxContent(req.file!);
      logger.substep('GPX Content Extracted', {
        contentLength: gpxContent.length,
        contentPreview: gpxContent.substring(0, 500) + '...',
      });
      
      let parsedGpx;
      try {
        parsedGpx = parseGpxContent(gpxContent);
      } catch (error) {
        throw gpxParseFailure(error instanceof Error ? error : new Error('Unknown error'));
      }

      routeMetrics = analyzeRoute(parsedGpx);
      logger.success('Route Metrics Calculated', {
        totalDistance: routeMetrics.totalDistance + ' km',
        elevationGain: routeMetrics.elevationGain + ' m',
        elevationLoss: routeMetrics.elevationLoss + ' m',
        maxGradient: routeMetrics.maxGradient + '%',
        avgGradient: routeMetrics.avgGradient + '%',
        difficultyRating: routeMetrics.difficultyRating,
      });

      const points = getFirstTrackPoints(parsedGpx);
      const lastPoint = points.length > 0 ? points[points.length - 1] : undefined;
      logger.debug('GPX Points Extracted', {
        totalPoints: points.length,
        firstPoint: points[0] ? { lat: points[0].latitude, lon: points[0].longitude, elev: points[0].elevation } : null,
        lastPoint: lastPoint ? { lat: lastPoint.latitude, lon: lastPoint.longitude, elev: lastPoint.elevation } : null,
      });

      logger.time('osm-enrichment');
      const { enrichments, status } = await enrichRouteWithOsm(points);
      logger.timing('OSM Enrichment', 'osm-enrichment', {
        osmAvailable: status.osmAvailable,
        segmentsProcessed: status.segmentsProcessed,
        segmentsWithOsmData: status.segmentsWithOsmData,
        fallbackSegments: status.fallbackSegments,
        fallbackMode: status.fallbackMode,
        error: status.error,
      });

      const segments = segmentRoute(points, enrichments);
      logger.debug('Route Segmented', {
        segmentCount: segments.length,
        sampleSegments: segments.slice(0, 5).map(s => ({
          index: s.index,
          surface: s.surface,
          distance: Math.round(s.distance) + ' m',
          gradient: Math.round(s.gradient * 10) / 10 + '%',
        })),
      });

      terrainProfile = buildTerrainProfile(segments, enrichments, routeMetrics, status);
      logger.success('Terrain Profile Built', {
        composition: {
          asphalt: Math.round(terrainProfile.composition.asphalt * 100) + '%',
          gravel: Math.round(terrainProfile.composition.gravel * 100) + '%',
          dirt: Math.round(terrainProfile.composition.dirt * 100) + '%',
          rocky: Math.round(terrainProfile.composition.rocky * 100) + '%',
          technical: Math.round(terrainProfile.composition.technical * 100) + '%',
        },
        scores: {
          roughness: Math.round(terrainProfile.scores.roughness * 100) + '%',
          technicality: Math.round(terrainProfile.scores.technicality * 100) + '%',
          flow: Math.round(terrainProfile.scores.flow * 100) + '%',
        },
      });

    } else if (hasManualTerrain) {
      inputMode = 'manual';
      logger.debug('Manual Terrain Input', { mode: 'manual' });
      
      routeMetrics = undefined;
      const manualInput: { asphalt?: number; gravel?: number; dirt?: number; rocky?: number; technical?: number } = {};
      if (riderInput.manualTerrain?.asphalt !== undefined) manualInput.asphalt = riderInput.manualTerrain.asphalt;
      if (riderInput.manualTerrain?.gravel !== undefined) manualInput.gravel = riderInput.manualTerrain.gravel;
      if (riderInput.manualTerrain?.dirt !== undefined) manualInput.dirt = riderInput.manualTerrain.dirt;
      if (riderInput.manualTerrain?.rocky !== undefined) manualInput.rocky = riderInput.manualTerrain.rocky;
      if (riderInput.manualTerrain?.technical !== undefined) manualInput.technical = riderInput.manualTerrain.technical;
      terrainProfile = buildManualTerrainProfile(manualInput);
      logger.success('Manual Terrain Profile Built', {
        manualInput: riderInput.manualTerrain,
        composition: {
          asphalt: Math.round(terrainProfile.composition.asphalt * 100) + '%',
          gravel: Math.round(terrainProfile.composition.gravel * 100) + '%',
          dirt: Math.round(terrainProfile.composition.dirt * 100) + '%',
          rocky: Math.round(terrainProfile.composition.rocky * 100) + '%',
          technical: Math.round(terrainProfile.composition.technical * 100) + '%',
        },
      });

    } else {
      throw gpxFileMissing();
    }

    logger.debug('Pressure Calculation Starting', {
      riderInput,
      terrainProfileComposition: terrainProfile.composition,
    });
    
    const pressureResult = calculateFullPressureResultV2(riderInput, terrainProfile);
    logger.success('Pressure Calculated', {
      baseline: {
        frontPsi: pressureResult.baseline.frontPsi,
        rearPsi: pressureResult.baseline.rearPsi,
      },
      adjusted: {
        frontPsi: pressureResult.adjusted.frontPsi,
        rearPsi: pressureResult.adjusted.rearPsi,
      },
      terrainAdjustment: pressureResult.adjusted.terrainAdjustment,
      tubelessBonus: pressureResult.adjusted.tubelessBonus,
      totalAdjustment: pressureResult.adjusted.totalAdjustment,
      appliedWeights: pressureResult.terrainBased?.appliedWeights?.map(w => ({
        surface: w.surface,
        weight: Math.round(w.weight * 100) + '%',
        modifier: w.modifier,
        contribution: Math.round(w.contribution * 100) / 100,
      })),
    });

    const aiContext = {
      riderWeight: riderInput.riderWeight,
      bikeType: riderInput.bikeType,
      tireWidth: riderInput.tireWidth,
      tubeless: riderInput.tubeless,
      ridingStyle: riderInput.ridingStyle,
      skillLevel: riderInput.skillLevel,
      terrainProfile,
      routeMetrics,
      baselinePsi: {
        front: pressureResult.baseline.frontPsi,
        rear: pressureResult.baseline.rearPsi,
      },
      adjustedPsi: {
        front: pressureResult.adjusted.frontPsi,
        rear: pressureResult.adjusted.rearPsi,
      },
      inputMode,
    };
    
    logger.debug('AI Context Prepared', {
      context: aiContext,
    });

    logger.time('llm-call');
    const aiResponse = await callOpenAI(aiContext);
    const llmDuration = logger.timeEnd('llm-call');

    const aiRecommendation = aiResponse.success && aiResponse.recommendation
      ? aiResponse.recommendation
      : createFallbackRecommendation({
        front: pressureResult.adjusted.frontPsi,
        rear: pressureResult.adjusted.rearPsi,
      });

    logger.success('LLM Response Received', {
      duration: llmDuration + ' ms',
      success: aiResponse.success,
      fallbackUsed: aiResponse.fallbackUsed,
      recommendation: {
        frontPsi: aiRecommendation.frontPsi,
        rearPsi: aiRecommendation.rearPsi,
        reasoning: aiRecommendation.reasoning?.substring(0, 200) + (aiRecommendation.reasoning?.length > 200 ? '...' : ''),
        confidence: aiRecommendation.confidence,
        warnings: aiRecommendation.warnings,
      },
    });

    const response: AnalyzeResponseV2 = {
      baseline: {
        frontPsi: pressureResult.baseline.frontPsi,
        rearPsi: pressureResult.baseline.rearPsi,
      },
      adjusted: {
        frontPsi: pressureResult.adjusted.frontPsi,
        rearPsi: pressureResult.adjusted.rearPsi,
      },
      aiRecommendation,
      routeMetrics,
      terrainProfile,
      inputMode,
      terrainBased: {
        composition: terrainProfile.composition,
        appliedWeights: pressureResult.terrainBased?.appliedWeights ?? [],
      },
      osmEnrichmentStatus: terrainProfile.osmEnrichmentStatus ?? {
        osmAvailable: false,
        segmentsProcessed: 0,
        segmentsWithOsmData: 0,
        fallbackSegments: 0,
        fallbackMode: 'manual',
      },
    };

    const totalDuration = Date.now() - startTime;
    logger.success('Request Complete', {
      totalDuration: totalDuration + ' ms',
      inputMode,
      finalResult: {
        baselineFront: response.baseline.frontPsi + ' psi',
        baselineRear: response.baseline.rearPsi + ' psi',
        adjustedFront: response.adjusted.frontPsi + ' psi',
        adjustedRear: response.adjusted.rearPsi + ' psi',
        aiFront: aiRecommendation.frontPsi + ' psi',
        aiRear: aiRecommendation.rearPsi + ' psi',
      },
    });
    
    logger.clearRequestId();

    res.json(response);

  } catch (error) {
    logger.error('Handler Error', error instanceof Error ? error : new Error('Unknown error'));
    logger.clearRequestId();
    next(error);
  }
}

export async function analyzeHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await analyzeHandlerV2(req, res, next);
}