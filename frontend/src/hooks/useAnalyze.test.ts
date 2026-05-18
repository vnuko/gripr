import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../../src/api/client.js", () => ({
  analyzeRoute: vi.fn().mockResolvedValue({
    baseline: { front: 22, rear: 25, confidence: 47, note: "test" },
    terrainAdjusted: { front: 20, rear: 23, confidence: 62, note: "test" },
    aiRecommended: { front: 21, rear: 24, confidence: 85, note: "test" },
  }),
  analyzeTerrain: vi.fn().mockResolvedValue({
    baseline: { front: 22, rear: 25, confidence: 47, note: "test" },
    terrainAdjusted: { front: 20, rear: 23, confidence: 62, note: "test" },
    aiRecommended: { front: 21, rear: 24, confidence: 85, note: "test" },
  }),
  computeMockRecommendations: vi.fn().mockResolvedValue({
    baseline: { front: 22, rear: 25, confidence: 47, note: "test" },
    terrainAdjusted: { front: 20, rear: 23, confidence: 62, note: "test" },
    aiRecommended: { front: 21, rear: 24, confidence: 85, note: "test" },
  }),
}));

describe("useAnalyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start with idle status", () => {
    const { result } = renderHook(() => useAnalyze());

    expect(result.current.status).toBe("idle");
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should reset to idle state", async () => {
    const { result } = renderHook(() => useAnalyze());

    const riderInput = {
      riderWeight: 82,
      bikeType: "trail",
      tireFront: 2.4,
      tireRear: 2.4,
      wheelSize: '29"',
      tubeless: true,
      tireInserts: false,
      skillLevel: "advanced",
      ridingStyle: "moderate",
      selectedTerrains: ["Rocky Terrain"],
      weather: "damp",
      temperature: 14,
    };

    await act(async () => {
      await result.current.analyze(null, riderInput);
    });

    expect(result.current.status).toBe("success");

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

import { useAnalyze } from "../../src/hooks/useAnalyze.js";
