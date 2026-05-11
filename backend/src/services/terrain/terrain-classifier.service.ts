import type {
  TerrainClassificationInput,
  TerrainClassification,
} from './terrain.types.js';

export function classifyTerrain(input: TerrainClassificationInput): TerrainClassification {
  const { totalDistance, elevationGain, elevationLoss, maxGradient, difficultyRating, bikeType } =
    input;

  return {
    rockyTerrain: classifyRockyTerrain(difficultyRating, maxGradient, bikeType),
    wetRoots: classifyWetRoots(difficultyRating, bikeType),
    fastFlowTrail: classifyFastFlowTrail(totalDistance, elevationGain, maxGradient, bikeType),
    longGravelRide: classifyLongGravelRide(totalDistance, bikeType),
    technicalDescent: classifyTechnicalDescent(elevationLoss, maxGradient, difficultyRating),
  };
}

function classifyRockyTerrain(
  difficultyRating: string,
  maxGradient: number,
  bikeType: string
): boolean {
  if (bikeType === 'gravel') return false;
  if (bikeType === 'xc') return difficultyRating === 'hard' || difficultyRating === 'expert';
  return (
    difficultyRating === 'hard' || difficultyRating === 'expert' || Math.abs(maxGradient) > 20
  );
}

function classifyWetRoots(difficultyRating: string, bikeType: string): boolean {
  if (bikeType === 'gravel') return false;
  return (
    bikeType === 'enduro' || bikeType === 'downhill' || difficultyRating === 'hard' ||
    difficultyRating === 'expert'
  );
}

function classifyFastFlowTrail(
  totalDistance: number,
  elevationGain: number,
  maxGradient: number,
  bikeType: string
): boolean {
  if (bikeType === 'gravel') return false;
  const lowElevationGain = elevationGain < 300;
  const moderateGradient = Math.abs(maxGradient) < 15;
  const moderateDistance = totalDistance > 5 && totalDistance < 20;
  return lowElevationGain && moderateGradient && moderateDistance && bikeType !== 'downhill';
}

function classifyLongGravelRide(totalDistance: number, bikeType: string): boolean {
  return bikeType === 'gravel' && totalDistance > 30;
}

function classifyTechnicalDescent(
  elevationLoss: number,
  maxGradient: number,
  difficultyRating: string
): boolean {
  const significantDescent = elevationLoss > 400;
  const steepGradient = Math.abs(maxGradient) > 15;
  return (
    significantDescent && steepGradient &&
    (difficultyRating === 'hard' || difficultyRating === 'expert')
  );
}