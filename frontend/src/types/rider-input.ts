export type BikeType = 'trail' | 'enduro' | 'xc' | 'downhill' | 'gravel';

export type RidingStyle = 'conservative' | 'moderate' | 'aggressive';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type WeatherCondition = 'dry' | 'damp' | 'wet';

export interface RiderInput {
  riderWeight: number;
  bikeType: BikeType;
  tireWidth: number;
  tubeless: boolean;
  ridingStyle: RidingStyle;
  skillLevel: SkillLevel;
  tireFront: number;
  tireRear: number;
  wheelSize: string;
  tireInserts: boolean;
}

export interface TerrainInput {
  selectedTerrains: string[];
  weather: WeatherCondition;
  temperature: number;
}

export const BIKE_TYPE_OPTIONS: { value: BikeType; label: string; description: string }[] = [
  { value: 'xc', label: 'XC', description: 'Cross Country — Fast and efficient' },
  { value: 'trail', label: 'Trail', description: 'Versatile all-mountain riding' },
  { value: 'enduro', label: 'Enduro', description: 'Aggressive downhill and technical' },
  { value: 'downhill', label: 'Downhill', description: 'Pure downhill performance' },
  { value: 'gravel', label: 'Gravel', description: 'Mixed terrain endurance riding' },
];

export const RIDING_STYLE_OPTIONS: { value: RidingStyle; label: string; description: string }[] = [
  { value: 'conservative', label: 'Casual', description: 'Comfort & control, relaxed trail days' },
  { value: 'moderate', label: 'Balanced', description: 'All-round performance & efficiency' },
  { value: 'aggressive', label: 'Aggressive', description: 'Max traction, fast cornering' },
];

export const SKILL_LEVEL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export const WHEEL_SIZE_OPTIONS: string[] = ['27.5"', '29"'];

export const TERRAIN_OPTIONS: { label: string }[] = [
  { label: 'Rocky Terrain' },
  { label: 'Wet Roots' },
  { label: 'Fast Flow Trail' },
  { label: 'Long Gravel Ride' },
  { label: 'Technical Descents' },
  { label: 'Loose Corners' },
  { label: 'Muddy Conditions' },
  { label: 'Dry Hardpack' },
];

export const WEATHER_OPTIONS: { value: WeatherCondition; label: string }[] = [
  { value: 'dry', label: 'Dry' },
  { value: 'damp', label: 'Damp' },
  { value: 'wet', label: 'Wet' },
];