import type { AIContextV2, AIContext } from './ai.types.js';
import type { TerrainComposition, TerrainScores, TerrainProfile } from '../terrain/terrain.types.js';

export function buildValidationPrompt(context: AIContext): string {
  const terrainDescriptions = formatTerrainFlags(context.terrainFlags);
  const routeDescription = formatRouteMetrics(context.routeMetrics);

  return `
You are an expert mountain bike and cycling tire pressure advisor.

Given the following rider and route information, validate and refine the tire pressure recommendation.

## Rider Information
- Weight: ${context.riderWeight} kg
- Bike Type: ${context.bikeType}
- Tire Width: ${context.tireWidth} inches
- Tubeless: ${context.tubeless ? 'Yes' : 'No'}
- Riding Style: ${context.ridingStyle}

## Route Characteristics
${routeDescription}

## Terrain Conditions
${terrainDescriptions}

## Calculated Pressure
- Baseline Front: ${context.baselinePsi.front} PSI
- Baseline Rear: ${context.baselinePsi.rear} PSI
- Adjusted Front: ${context.adjustedPsi.front} PSI
- Adjusted Rear: ${context.adjustedPsi.rear} PSI

## Your Task
Review the calculated pressure values. You may:
1. Validate the values are appropriate
2. Make minor adjustments (±2 PSI) if warranted
3. Explain your reasoning considering the rider profile, terrain, and route

## Safety Constraints
- Front PSI must stay between 12-35 PSI
- Rear PSI must stay between 15-40 PSI
- Prioritize: grip, comfort, and puncture protection
- Do not make extreme changes
- If values are already optimal, validate them without modification

## Response Format (JSON)
Provide your response as valid JSON with this exact structure:
{
  "frontPsi": <number>,
  "rearPsi": <number>,
  "reasoning": "<explanation of your recommendation>",
  "confidence": "high" | "medium" | "low",
  "warnings": ["<any safety concerns>"] (optional)
}

Respond ONLY with the JSON object, no additional text.
`.trim();
}

export function buildPromptV2(context: AIContextV2): string {
  const terrainDescription = formatTerrainProfileV2(context.terrainProfile);
  const inputModeDescription = context.inputMode === 'gpx'
    ? 'Based on GPX route analysis with OpenStreetMap terrain enrichment'
    : 'Based on manually specified terrain composition';

  return `
You are an expert mountain bike tire pressure advisor. Analyze the following rider and terrain data to validate and refine tire pressure recommendations.

## Rider Profile
- Weight: ${context.riderWeight} kg
- Bike Type: ${context.bikeType}
- Tire Width: ${context.tireWidth} inches
- Tubeless: ${context.tubeless ? 'Yes' : 'No'}
- Riding Style: ${context.ridingStyle}
- Skill Level: ${context.skillLevel}

## Terrain Analysis (${inputModeDescription})
${terrainDescription}

## Calculated Pressures
- Baseline: Front ${context.baselinePsi.front} PSI, Rear ${context.baselinePsi.rear} PSI
- Terrain-adjusted: Front ${context.adjustedPsi.front} PSI, Rear ${context.adjustedPsi.rear} PSI

## Your Task
1. Validate the terrain-adjusted pressures considering:
   - Terrain composition percentages
   - Roughness and technicality scores
   - Rider weight and tire width relationship
   - Riding style, skill level, and bike type
2. Recommend final pressures (±1-2 PSI from calculated values allowed)
3. Explain your reasoning focusing on terrain considerations and rider skill

## Output Format
Respond in JSON format:
{
  "frontPsi": number,
  "rearPsi": number,
  "reasoning": "string explaining terrain-based reasoning and skill considerations",
  "confidence": "high" | "medium" | "low"
}

IMPORTANT: Do NOT override the physics-based calculation completely. Only refine within ±2 PSI based on terrain nuances and rider skill level.
`;
}

function formatTerrainProfileV2(profile: TerrainProfile): string {
  const composition = formatComposition(profile.composition);
  const scores = formatScores(profile.scores);
  const enrichment = formatEnrichmentStatus(profile.osmEnrichmentStatus);

  return `
### Terrain Composition (by distance percentage)
${composition}

### Terrain Scores
${scores}

### Data Source
${enrichment}
`;
}

function formatComposition(composition: TerrainComposition): string {
  const lines: string[] = [];
  
  if (composition.asphalt > 0) {
    lines.push(`- Asphalt: ${formatPercent(composition.asphalt)} (smooth surface, higher pressure acceptable)`);
  }
  if (composition.gravel > 0) {
    lines.push(`- Gravel: ${formatPercent(composition.gravel)} (moderate grip needs)`);
  }
  if (composition.dirt > 0) {
    lines.push(`- Dirt: ${formatPercent(composition.dirt)} (natural terrain, moderate pressure)`);
  }
  if (composition.rocky > 0) {
    lines.push(`- Rocky: ${formatPercent(composition.rocky)} (lower pressure for puncture protection and grip)`);
  }
  if (composition.technical > 0) {
    lines.push(`- Technical: ${formatPercent(composition.technical)} (challenging features, lower pressure recommended)`);
  }
  
  if (lines.length === 0) {
    lines.push('- Unknown terrain (default assumptions applied)');
  }
  
  return lines.join('\n');
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatScores(scores: TerrainScores): string {
  return `
- Roughness: ${formatScore(scores.roughness)} (${interpretRoughness(scores.roughness)})
- Technicality: ${formatScore(scores.technicality)} (${interpretTechnicality(scores.technicality)})
- Flow: ${formatScore(scores.flow)} (${interpretFlow(scores.flow)})
`;
}

function formatScore(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function interpretRoughness(score: number): string {
  if (score < 0.3) return 'smooth';
  if (score < 0.5) return 'moderate';
  if (score < 0.7) return 'rough';
  return 'very rough';
}

function interpretTechnicality(score: number): string {
  if (score < 0.3) return 'easy';
  if (score < 0.5) return 'moderate';
  if (score < 0.7) return 'challenging';
  return 'technical';
}

function interpretFlow(score: number): string {
  if (score < 0.3) return 'interrupted';
  if (score < 0.5) return 'moderate flow';
  if (score < 0.7) return 'good flow';
  return 'excellent flow';
}

function formatEnrichmentStatus(status?: TerrainProfile['osmEnrichmentStatus']): string {
  if (!status) return 'No enrichment status available';
  
  if (status.osmAvailable) {
    const matchRate = status.segmentsProcessed > 0
      ? Math.round((status.segmentsWithOsmData / status.segmentsProcessed) * 100)
      : 0;
    return `OpenStreetMap enriched (${matchRate}% match rate)`;
  }
  
  if (status.fallbackMode === 'manual') {
    return 'Manually specified terrain composition';
  }
  
  return `Level 1 heuristics fallback (${status.error ?? 'OSM unavailable'})`;
}

function formatTerrainFlags(flags: AIContext['terrainFlags']): string {
  const conditions: string[] = [];

  if (flags.rockyTerrain) conditions.push('- Rocky terrain present');
  if (flags.wetRoots) conditions.push('- Wet roots possible');
  if (flags.fastFlowTrail) conditions.push('- Fast flow trail characteristics');
  if (flags.longGravelRide) conditions.push('- Long gravel ride');
  if (flags.technicalDescent) conditions.push('- Technical descent sections');

  if (conditions.length === 0) {
    return '- No specific terrain flags identified';
  }

  return conditions.join('\n');
}

function formatRouteMetrics(metrics: AIContext['routeMetrics']): string {
  return `
- Total Distance: ${metrics.totalDistance} km
- Elevation Gain: ${metrics.elevationGain} m
- Elevation Loss: ${metrics.elevationLoss} m
- Maximum Gradient: ${metrics.maxGradient}%
- Average Gradient: ${metrics.avgGradient}%
- Difficulty Rating: ${metrics.difficultyRating}
`.trim();
}