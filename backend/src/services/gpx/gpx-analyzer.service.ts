import type { ParsedGpx, ParsedTrackPoint, ElevationProfile, DistanceCalculation } from './gpx.types.js';
import { getFirstTrackPoints } from './gpx-parser.service.js';
import type { RouteMetrics, DifficultyRating } from '../../types/analyze.types.js';

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateDistanceBetweenPoints(p1: ParsedTrackPoint, p2: ParsedTrackPoint): number {
  const lat1 = toRadians(p1.latitude);
  const lat2 = toRadians(p2.latitude);
  const deltaLat = toRadians(p2.latitude - p1.latitude);
  const deltaLon = toRadians(p2.longitude - p1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function calculateTotalDistance(points: ParsedTrackPoint[]): DistanceCalculation {
  if (points.length < 2) {
    return { totalDistance: 0, segmentDistances: [] };
  }

  const segmentDistances: number[] = [];

  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currPoint = points[i];
    if (prevPoint && currPoint) {
      const distance = calculateDistanceBetweenPoints(prevPoint, currPoint);
      segmentDistances.push(distance);
    }
  }

  const totalDistance = segmentDistances.reduce((sum, d) => sum + d, 0);

  return { totalDistance, segmentDistances };
}

export function calculateElevationProfile(
  points: ParsedTrackPoint[],
  distances: number[]
): ElevationProfile {
  const elevations: number[] = points.map((p) => p.elevation ?? 0);
  const gradients: number[] = [];

  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currPoint = points[i];
    const prevDistance = distances[i - 1];
    if (prevPoint && currPoint && prevDistance !== undefined) {
      const elevationDelta = (currPoint.elevation ?? 0) - (prevPoint.elevation ?? 0);
      const distanceDelta = prevDistance * 1000;

      if (distanceDelta > 0) {
        gradients.push((elevationDelta / distanceDelta) * 100);
      } else {
        gradients.push(0);
      }
    }
  }

  gradients.unshift(0);

  return { elevations, distances, gradients };
}

export function calculateElevationGainLoss(points: ParsedTrackPoint[]): {
  elevationGain: number;
  elevationLoss: number;
} {
  let elevationGain = 0;
  let elevationLoss = 0;

  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currPoint = points[i];
    if (prevPoint && currPoint) {
      const prevElevation = prevPoint.elevation ?? 0;
      const currElevation = currPoint.elevation ?? 0;
      const delta = currElevation - prevElevation;

      if (delta > 0) {
        elevationGain += delta;
      } else if (delta < 0) {
        elevationLoss += Math.abs(delta);
      }
    }
  }

  return { elevationGain, elevationLoss };
}

export function calculateMaxGradient(gradients: number[]): number {
  if (gradients.length === 0) return 0;
  return Math.max(...gradients.map(Math.abs));
}

export function calculateAverageGradient(gradients: number[]): number {
  if (gradients.length === 0) return 0;
  const nonZeroGradients = gradients.filter((g) => Math.abs(g) > 0.5);
  if (nonZeroGradients.length === 0) return 0;

  const sum = nonZeroGradients.reduce((acc, g) => acc + Math.abs(g), 0);
  return sum / nonZeroGradients.length;
}

export function determineDifficultyRating(
  totalDistance: number,
  elevationGain: number,
  maxGradient: number
): DifficultyRating {
  const distanceScore =
    totalDistance > 50 ? 4 : totalDistance > 30 ? 3 : totalDistance > 15 ? 2 : 1;
  const elevationScore =
    elevationGain > 1500 ? 4 : elevationGain > 800 ? 3 : elevationGain > 400 ? 2 : 1;
  const gradientScore =
    Math.abs(maxGradient) > 25 ? 4 : Math.abs(maxGradient) > 15 ? 3 : Math.abs(maxGradient) > 10 ? 2 : 1;

  const totalScore = distanceScore + elevationScore + gradientScore;

  if (totalScore >= 10) return 'expert';
  if (totalScore >= 7) return 'hard';
  if (totalScore >= 4) return 'moderate';
  return 'easy';
}

export function analyzeRoute(parsedGpx: ParsedGpx): RouteMetrics {
  const points = getFirstTrackPoints(parsedGpx);

  if (points.length === 0) {
    return {
      totalDistance: 0,
      elevationGain: 0,
      elevationLoss: 0,
      maxGradient: 0,
      avgGradient: 0,
      difficultyRating: 'easy',
    };
  }

  const { totalDistance, segmentDistances } = calculateTotalDistance(points);
  const { elevationGain, elevationLoss } = calculateElevationGainLoss(points);
  const elevationProfile = calculateElevationProfile(points, segmentDistances);

  const maxGradient = calculateMaxGradient(elevationProfile.gradients);
  const avgGradient = calculateAverageGradient(elevationProfile.gradients);
  const difficultyRating = determineDifficultyRating(totalDistance, elevationGain, maxGradient);

  return {
    totalDistance: Math.round(totalDistance * 100) / 100,
    elevationGain: Math.round(elevationGain),
    elevationLoss: Math.round(elevationLoss),
    maxGradient: Math.round(maxGradient * 10) / 10,
    avgGradient: Math.round(avgGradient * 10) / 10,
    difficultyRating,
  };
}