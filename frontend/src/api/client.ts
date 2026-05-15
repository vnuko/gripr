import type { AnalyzeResponse, HealthResponse, AnalyzeRequest } from './generated.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const BACKEND_TERRAIN_TYPES = {
  rocky: 'rocky',
  technical: 'technical',
  dirt: 'dirt',
  gravel: 'gravel',
  asphalt: 'asphalt',
} as const;

type BackendTerrainType = keyof typeof BACKEND_TERRAIN_TYPES;

const TERRAIN_MAPPING: Record<string, BackendTerrainType> = {
  'Road / Paved Path': 'asphalt',
  'Gravel / Dirt Roads': 'gravel',
  'Forest / Soil Trails': 'dirt',
  'Muddy / Soft Ground': 'dirt',
  'Rocky / Stony Terrain': 'rocky',
  'Roots / Rough Trails': 'technical',
  'Steep / Extreme Descents': 'technical',
};

interface BackendAnalyzeResponse {
  baseline: { frontPsi: number; rearPsi: number };
  adjusted: { frontPsi: number; rearPsi: number };
  aiRecommendation: {
    frontPsi: number;
    rearPsi: number;
    reasoning: string;
    confidence?: 'high' | 'medium' | 'low';
    warnings?: string[];
  };
  routeMetrics?: {
    totalDistance: number;
    elevationGain: number;
    elevationLoss: number;
    maxGradient: number;
    avgGradient: number;
    difficultyRating: string;
  };
  terrainProfile?: {
    composition: {
      asphalt: number;
      gravel: number;
      dirt: number;
      rocky: number;
      technical: number;
    };
  };
  inputMode: 'gpx' | 'manual';
}

function transformBackendResponse(
  backendResponse: BackendAnalyzeResponse
): AnalyzeResponse {
  return {
    baseline: {
      front: backendResponse.baseline.frontPsi,
      rear: backendResponse.baseline.rearPsi,
      confidence: 65,
      note: 'Standard weight-based starting point.',
    },
    terrainAdjusted: {
      front: backendResponse.adjusted.frontPsi,
      rear: backendResponse.adjusted.rearPsi,
      confidence: 85,
      note: 'Adjusted for terrain and riding style.',
    },
    aiRecommended: {
      front: backendResponse.aiRecommendation.frontPsi,
      rear: backendResponse.aiRecommendation.rearPsi,
      confidence:
        backendResponse.aiRecommendation.confidence === 'high'
          ? 95
          : backendResponse.aiRecommendation.confidence === 'medium'
          ? 80
          : 70,
      note: backendResponse.aiRecommendation.reasoning,
    },
    routeMetrics: backendResponse.routeMetrics,
    warnings: backendResponse.aiRecommendation.warnings,
  };
}

function resolveTireWidth(
  tireFront: number | undefined,
  tireRear: number | undefined,
  bikeType: string
): number {
  const BIKE_TYPE_DEFAULTS: Record<string, number> = {
    xc: 2.2,
    trail: 2.4,
    enduro: 2.5,
    downhill: 2.5,
    gravel: 1.77,
  };

  if (tireFront !== undefined && !isNaN(tireFront) && tireFront > 0) return tireFront;
  if (tireRear !== undefined && !isNaN(tireRear) && tireRear > 0) return tireRear;
  return BIKE_TYPE_DEFAULTS[bikeType] ?? 2.4;
}

function mapTerrainsToPercentages(selectedTerrains: string[]): {
  asphalt?: number;
  gravel?: number;
  dirt?: number;
  rocky?: number;
  technical?: number;
} {
  if (selectedTerrains.length === 0) {
    return { dirt: 1 };
  }

  const backendTypes: Record<string, number> = {};
  
  for (const terrain of selectedTerrains) {
    const backendType = TERRAIN_MAPPING[terrain];
    if (backendType) {
      backendTypes[backendType] = (backendTypes[backendType] || 0) + 1;
    }
  }

  const total = selectedTerrains.length;
  const result: Record<string, number> = {};
  
  for (const [type, count] of Object.entries(backendTypes)) {
    result[type] = count / total;
  }

  return result;
}

export async function analyzeRoute(
  file: File,
  riderInput: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('riderWeight', riderInput.riderWeight.toString());
  formData.append('bikeType', riderInput.bikeType);
  formData.append('tireWidth', resolveTireWidth(riderInput.tireFront, riderInput.tireRear, riderInput.bikeType).toString());
  formData.append('tubeless', riderInput.tubeless.toString());
  formData.append('ridingStyle', riderInput.ridingStyle);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message ?? 'Analysis failed');
  }

  const backendResponse: BackendAnalyzeResponse = await response.json();
  return transformBackendResponse(backendResponse);
}

export async function analyzeTerrain(
  riderInput: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const manualTerrain = mapTerrainsToPercentages(riderInput.selectedTerrains || []);

  const body = {
    riderWeight: riderInput.riderWeight,
    bikeType: riderInput.bikeType,
    tireWidth: resolveTireWidth(riderInput.tireFront, riderInput.tireRear, riderInput.bikeType),
    tubeless: riderInput.tubeless,
    ridingStyle: riderInput.ridingStyle,
    manualTerrain,
  };

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message ?? 'Analysis failed');
  }

  const backendResponse: BackendAnalyzeResponse = await response.json();
  return transformBackendResponse(backendResponse);
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  
  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
}

export function computeMockRecommendations(state: AnalyzeRequest): AnalyzeResponse {
  const {
    riderWeight,
    skillLevel,
    ridingStyle,
    bikeType,
    tireFront,
    tireRear,
    tubeless,
    tireInserts,
    selectedTerrains,
    weather,
    temperature,
  } = state;

  const w = riderWeight || 80;
  const tf = tireFront || 2.4;
  const tr = tireRear || 2.4;

  let baseFront = Math.round((w * 0.08 + (2.4 / tf) * 6) * 10) / 10;
  let baseRear = Math.round((w * 0.1 + (2.4 / tr) * 5) * 10) / 10;
  baseFront = Math.max(18, Math.min(36, baseFront));
  baseRear = Math.max(20, Math.min(38, baseRear));

  const skillAdj: Record<string, number> = {
    beginner: 2,
    intermediate: 0,
    advanced: -1.5,
    expert: -3,
  };
  const styleAdj: Record<string, number> = {
    conservative: 2,
    moderate: 0,
    aggressive: -2,
  };
  const bikeAdj: Record<string, number> = {
    xc: 3,
    trail: 0,
    enduro: -1.5,
    downhill: -3,
    gravel: 2,
  };
  const weatherAdj: Record<string, number> = {
    dry: 1,
    damp: -0.5,
    wet: -2,
  };

  const sAdj = skillAdj[skillLevel] ?? 0;
  const rAdj = styleAdj[ridingStyle] ?? 0;
  const bAdj = bikeAdj[bikeType] ?? 0;
  const wAdj = weatherAdj[weather] ?? 0;
  const tubelessAdj = tubeless ? -2 : 0;
  const insertAdj = tireInserts ? -1 : 0;
  const rockyAdj = (selectedTerrains?.includes('Rocky / Stony Terrain') ?? false) ? -0.5 : 0;
  const wetRootsAdj = (selectedTerrains?.includes('Roots / Rough Trails') ?? false) ? -0.5 : 0;
  const tempAdj = temperature < 5 ? -1 : temperature > 30 ? 1 : 0;

  const terrainAdjFront = Math.round((baseFront + sAdj + rAdj + bAdj + wAdj + rockyAdj + wetRootsAdj) * 2) / 2;
  const terrainAdjRear = Math.round((baseRear + sAdj + rAdj + bAdj + wAdj + rockyAdj) * 2) / 2;

  const aiFront = Math.round((terrainAdjFront + tubelessAdj + insertAdj + tempAdj) * 2) / 2;
  const aiRear = Math.round((terrainAdjRear + tubelessAdj * 0.7 + insertAdj + tempAdj) * 2) / 2;

  const clampF = (v: number) => Math.max(14, Math.min(38, v));
  const clampR = (v: number) => Math.max(16, Math.min(40, v));

  const confidenceBase = 72;
  const terrainBonus = (selectedTerrains?.length ?? 0) > 2 ? 8 : (selectedTerrains?.length ?? 0) > 0 ? 5 : 0;
  const confidence = Math.min(97, confidenceBase + terrainBonus + (tubeless ? 3 : 0) + (tireInserts ? 2 : 0));

  return {
    baseline: {
      front: clampF(Math.round(baseFront)),
      rear: clampR(Math.round(baseRear)),
      confidence: Math.round(confidence * 0.65),
      note: 'Standard weight-based starting point before terrain & setup factors.',
    },
    terrainAdjusted: {
      front: clampF(Math.round(terrainAdjFront)),
      rear: clampR(Math.round(terrainAdjRear)),
      confidence: Math.round(confidence * 0.85),
      note: 'Adjusted for selected terrain types, weather and riding style.',
    },
    aiRecommended: {
      front: clampF(Math.round(aiFront)),
      rear: clampR(Math.round(aiRear)),
      confidence,
      note: 'Full AI optimisation: tubeless setup, inserts, temperature & all terrain factors.',
    },
  };
}