import type { OverpassResponse, OsmWay } from '../../src/services/osm/osm.types.js';

export function createMockOsmWay(
  id: number,
  tags: Record<string, string>,
  geometry?: { lat: number; lon: number }[]
): OsmWay {
  return {
    id,
    type: 'way',
    nodes: geometry?.map((_, i) => 1000 + i) ?? [],
    tags,
    geometry,
  };
}

export const mockOsmResponses = {
  mixedTerrain: (): OverpassResponse => ({
    elements: [
      createMockOsmWay(1, { highway: 'track', surface: 'gravel' }, [
        { lat: 47.3769, lon: 8.5417 },
        { lat: 47.3770, lon: 8.5418 },
      ]),
      createMockOsmWay(2, { highway: 'path', surface: 'dirt', mtbScale: '3' }, [
        { lat: 47.3771, lon: 8.5419 },
        { lat: 47.3772, lon: 8.5420 },
      ]),
      createMockOsmWay(3, { highway: 'cycleway', surface: 'asphalt' }, [
        { lat: 47.3773, lon: 8.5421 },
        { lat: 47.3774, lon: 8.5422 },
      ]),
    ],
  }),
  
  asphaltOnly: (): OverpassResponse => ({
    elements: [
      createMockOsmWay(1, { highway: 'secondary', surface: 'asphalt' }, [
        { lat: 47.3769, lon: 8.5417 },
        { lat: 47.3770, lon: 8.5418 },
        { lat: 47.3771, lon: 8.5419 },
      ]),
    ],
  }),
  
  noElements: (): OverpassResponse => ({
    elements: [],
  }),
  
  errorResponse: (): OverpassResponse => ({
    elements: [],
    remark: 'error: timeout',
  }),
};