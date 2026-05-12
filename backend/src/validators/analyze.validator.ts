import { z } from 'zod';
import { manualTerrainSchema } from './terrain.validator.js';

export const riderInputSchema = z.object({
  riderWeight: z.coerce
    .number({
      required_error: 'Rider weight is required',
      invalid_type_error: 'Rider weight must be a number',
    })
    .min(40, 'Rider weight must be at least 40kg')
    .max(150, 'Rider weight must be at most 150kg'),

  bikeType: z.enum(['trail', 'enduro', 'xc', 'downhill', 'gravel'], {
    required_error: 'Bike type is required',
    invalid_type_error: 'Invalid bike type',
  }),

  tireWidth: z.coerce
    .number({
      invalid_type_error: 'Tire width must be a number',
    })
    .min(1.5, 'Tire width must be at least 1.5 inches')
    .max(3.0, 'Tire width must be at most 3.0 inches')
    .optional()
    .default(2.4),

  tubeless: z.coerce
    .boolean({
      required_error: 'Tubeless option is required',
      invalid_type_error: 'Tubeless must be true or false',
    }),

  ridingStyle: z.enum(['conservative', 'moderate', 'aggressive'], {
    required_error: 'Riding style is required',
    invalid_type_error: 'Invalid riding style',
  }),
});

export const riderInputV2Schema = riderInputSchema.extend({
  manualTerrain: manualTerrainSchema.optional(),
});

export type RiderInputSchema = z.infer<typeof riderInputSchema>;
export type RiderInputV2Schema = z.infer<typeof riderInputV2Schema>;

export function validateRiderInput(data: unknown) {
  return riderInputSchema.safeParse(data);
}

export function validateRiderInputV2(data: unknown) {
  return riderInputV2Schema.safeParse(data);
}