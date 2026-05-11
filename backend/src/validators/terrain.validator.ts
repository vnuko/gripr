import { z } from 'zod';

export const manualTerrainSchema = z.object({
  asphalt: z.number().min(0).max(1).optional(),
  gravel: z.number().min(0).max(1).optional(),
  dirt: z.number().min(0).max(1).optional(),
  rocky: z.number().min(0).max(1).optional(),
  technical: z.number().min(0).max(1).optional(),
}).refine((data) => {
  const values = Object.values(data).filter(v => v !== undefined) as number[];
  const sum = values.reduce((a, b) => a + b, 0);
  return sum > 0 && sum <= 2;
}, {
  message: 'Terrain percentages must have at least one non-zero value',
});

export type ManualTerrainInput = z.infer<typeof manualTerrainSchema>;

export function validateManualTerrain(data: unknown) {
  return manualTerrainSchema.safeParse(data);
}