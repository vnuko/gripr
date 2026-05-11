import { describe, it, expect } from 'vitest';
import { classifyTerrain } from '../../../src/services/terrain/terrain-classifier.service.js';

describe('Terrain Classifier', () => {
  describe('classifyTerrain', () => {
    it('should classify rocky terrain for hard/expert routes', () => {
      const result = classifyTerrain({
        totalDistance: 20,
        elevationGain: 800,
        elevationLoss: 600,
        maxGradient: 25,
        avgGradient: 12,
        difficultyRating: 'expert',
        bikeType: 'trail',
      });

      expect(result.rockyTerrain).toBe(true);
    });

    it('should not classify rocky terrain for gravel bikes', () => {
      const result = classifyTerrain({
        totalDistance: 50,
        elevationGain: 1000,
        elevationLoss: 800,
        maxGradient: 20,
        avgGradient: 10,
        difficultyRating: 'hard',
        bikeType: 'gravel',
      });

      expect(result.rockyTerrain).toBe(false);
    });

    it('should classify fast flow trail for moderate routes', () => {
      const result = classifyTerrain({
        totalDistance: 10,
        elevationGain: 100,
        elevationLoss: 80,
        maxGradient: 8,
        avgGradient: 5,
        difficultyRating: 'moderate',
        bikeType: 'trail',
      });

      expect(result.fastFlowTrail).toBe(true);
    });

    it('should classify long gravel ride for gravel bikes >30km', () => {
      const result = classifyTerrain({
        totalDistance: 50,
        elevationGain: 500,
        elevationLoss: 400,
        maxGradient: 10,
        avgGradient: 5,
        difficultyRating: 'moderate',
        bikeType: 'gravel',
      });

      expect(result.longGravelRide).toBe(true);
    });

    it('should not classify long gravel ride for non-gravel bikes', () => {
      const result = classifyTerrain({
        totalDistance: 50,
        elevationGain: 500,
        elevationLoss: 400,
        maxGradient: 10,
        avgGradient: 5,
        difficultyRating: 'moderate',
        bikeType: 'trail',
      });

      expect(result.longGravelRide).toBe(false);
    });

    it('should classify technical descent for steep routes', () => {
      const result = classifyTerrain({
        totalDistance: 15,
        elevationGain: 500,
        elevationLoss: 600,
        maxGradient: 18,
        avgGradient: 10,
        difficultyRating: 'hard',
        bikeType: 'enduro',
      });

      expect(result.technicalDescent).toBe(true);
    });

    it('should classify wet roots for enduro/downhill bikes', () => {
      const result = classifyTerrain({
        totalDistance: 10,
        elevationGain: 300,
        elevationLoss: 250,
        maxGradient: 15,
        avgGradient: 8,
        difficultyRating: 'moderate',
        bikeType: 'enduro',
      });

      expect(result.wetRoots).toBe(true);
    });

    it('should return all false for easy XC ride', () => {
      const result = classifyTerrain({
        totalDistance: 5,
        elevationGain: 100,
        elevationLoss: 80,
        maxGradient: 5,
        avgGradient: 3,
        difficultyRating: 'easy',
        bikeType: 'xc',
      });

      expect(result.rockyTerrain).toBe(false);
      expect(result.wetRoots).toBe(false);
      expect(result.fastFlowTrail).toBe(false);
      expect(result.longGravelRide).toBe(false);
      expect(result.technicalDescent).toBe(false);
    });
  });
});