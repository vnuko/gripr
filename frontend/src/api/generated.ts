export interface PressureResult {
  front: number;
  rear: number;
  confidence: number;
  note: string;
}

export interface RouteMetrics {
  totalDistance: number;
  elevationGain: number;
  elevationLoss: number;
  maxGradient: number;
  avgGradient: number;
  difficultyRating: string;
}

export interface TerrainFlags {
  rockyTerrain: boolean;
  wetRoots: boolean;
  fastFlowTrail: boolean;
  longGravelRide: boolean;
  technicalDescent: boolean;
}

export interface AnalyzeResponse {
  baseline: PressureResult;
  terrainAdjusted: PressureResult;
  aiRecommended: PressureResult;
  routeMetrics?: RouteMetrics;
  terrainFlags?: TerrainFlags;
  warnings?: string[];
}

export interface AnalyzeRequest {
  riderWeight: number;
  bikeType: string;
  tireFront: number;
  tireRear: number;
  wheelSize: string;
  tubeless: boolean;
  tireInserts: boolean;
  skillLevel: string;
  ridingStyle: string;
  selectedTerrains?: string[];
  weather: string;
  temperature: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version?: string;
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
  details?: unknown;
}

export interface Paths {
  "/api/analyze": {
    post: {
      requestBody: {
        content: {
          "multipart/form-data": {
            file: File;
            riderWeight: string;
            bikeType: string;
            tireFront: string;
            tireRear: string;
            wheelSize: string;
            tubeless: string;
            tireInserts: string;
            skillLevel: string;
            ridingStyle: string;
            selectedTerrains: string;
            weather: string;
            temperature: string;
          };
        };
      };
      responses: {
        200: {
          content: {
            "application/json": AnalyzeResponse;
          };
        };
        400: {
          content: {
            "application/json": ApiErrorResponse;
          };
        };
        500: {
          content: {
            "application/json": ApiErrorResponse;
          };
        };
      };
    };
  };
  "/health": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": HealthResponse;
          };
        };
      };
    };
  };
}
