import { http, HttpResponse } from "msw";

const ANALYZE_API_URL = "http://localhost:3000/api/analyze";

const mockSuccessResponse = {
  baseline: {
    front: 22,
    rear: 25,
    confidence: 47,
    note: "Standard weight-based starting point before terrain & setup factors.",
  },
  terrainAdjusted: {
    front: 20,
    rear: 23,
    confidence: 62,
    note: "Adjusted for selected terrain types, weather and riding style.",
  },
  aiRecommended: {
    front: 21,
    rear: 24,
    confidence: 85,
    note: "Full AI optimisation: tubeless setup, inserts, temperature & all terrain factors.",
  },
};

const mockErrorResponse = {
  error: "gpx_parse_error",
  message: "Invalid GPX file format",
  statusCode: 400,
};

const mockValidationErrorResponse = {
  error: "validation_error",
  message: "Invalid rider input",
  statusCode: 400,
};

export const handlers = [
  http.post(ANALYZE_API_URL, async ({ request }) => {
    const formData = await request.formData();
    const bikeType = formData.get("bikeType");
    const riderWeight = formData.get("riderWeight");

    if (riderWeight && Number(riderWeight) < 40) {
      return HttpResponse.json(mockValidationErrorResponse, { status: 400 });
    }

    if (bikeType === "invalid") {
      return HttpResponse.json(mockValidationErrorResponse, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    if (file?.name === "invalid.gpx") {
      return HttpResponse.json(mockErrorResponse, { status: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json(mockSuccessResponse);
  }),

  http.get("http://localhost:3000/health", () => {
    return HttpResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  }),
];

export const errorHandlers = [
  http.post(ANALYZE_API_URL, () => {
    return new HttpResponse(null, { status: 500 });
  }),
];

export const networkErrorHandlers = [
  http.post(ANALYZE_API_URL, () => {
    return HttpResponse.error();
  }),
];
