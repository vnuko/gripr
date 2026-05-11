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
  classifyTerrain,
} from '../services/terrain/index.js';
import { calculateFullPressureResultV2, calculateFullPressureResult } from '../services/pressure/index.js';
import { callOpenAI, createFallbackRecommendation } from '../services/ai/index.js';
import { fromZodError } from '../errors/validation-error.js';
import { gpxFileMissing, gpxInvalidFormat, gpxParseFailure } from '../errors/gpx-error.js';
import type { AnalyzeResponseV2, InputMode, RiderInputV2, TerrainFlags, RiderInput } from '../types/analyze.types.js';
import type { TerrainProfile } from '../services/terrain/terrain.types.js';

export interface AnalyzeRequestWithFile extends Request {
  file?: Express.Multer.File;
}

export async function analyzeHandlerV2(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const inputValidation = validateRiderInputV2({
      riderWeight: req.body.riderWeight,
      bikeType: req.body.bikeType,
      tireWidth: req.body.tireWidth,
      tubeless: req.body.tubeless,
      ridingStyle: req.body.ridingStyle,
      manualTerrain: req.body.manualTerrain,
    });

    if (!inputValidation.success) {
      throw fromZodError(inputValidation.error);
    }

    const riderInput: RiderInputV2 = inputValidation.data;
    const hasGpx = !!req.file;
    const hasManualTerrain = !!riderInput.manualTerrain;

    let inputMode: InputMode;
    let terrainProfile: TerrainProfile;
    let routeMetrics: any = undefined;

    if (hasGpx) {
      inputMode = 'gpx';
      
      const fileValidation = validateGpxFile(req.file);
      if (!fileValidation.valid) {
        if (fileValidation.error === 'No GPX file provided') {
          throw gpxFileMissing();
        }
        throw gpxInvalidFormat();
      }

      const gpxContent = extractGpxContent(req.file!);
      
      let parsedGpx;
      try {
        parsedGpx = parseGpxContent(gpxContent);
      } catch (error) {
        throw gpxParseFailure(error instanceof Error ? error : new Error('Unknown error'));
      }

      routeMetrics = analyzeRoute(parsedGpx);
      const points = getFirstTrackPoints(parsedGpx);

      const { enrichments, status } = await enrichRouteWithOsm(points);

      const segments = segmentRoute(points, enrichments);
      terrainProfile = buildTerrainProfile(segments, enrichments, routeMetrics, status);

    } else if (hasManualTerrain) {
      inputMode = 'manual';
      
      routeMetrics = undefined;
      terrainProfile = buildManualTerrainProfile(riderInput.manualTerrain);

    } else {
      throw gpxFileMissing();
    }

    const pressureResult = calculateFullPressureResultV2(riderInput, terrainProfile);

    const aiContext = {
      riderWeight: riderInput.riderWeight,
      bikeType: riderInput.bikeType,
      tireWidth: riderInput.tireWidth,
      tubeless: riderInput.tubeless,
      ridingStyle: riderInput.ridingStyle,
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

    const aiResponse = await callOpenAI(aiContext);

    const aiRecommendation = aiResponse.success && aiResponse.recommendation
      ? aiResponse.recommendation
      : createFallbackRecommendation({
        front: pressureResult.adjusted.frontPsi,
        rear: pressureResult.adjusted.rearPsi,
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
        appliedWeights: pressureResult.terrainBased.appliedWeights,
      },
      osmEnrichmentStatus: terrainProfile.osmEnrichmentStatus,
    };

    res.json(response);

  } catch (error) {
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