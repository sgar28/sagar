import { describe, it, expect } from 'vitest';
import { calculateDynamicPrice, getDemandFactor, getTimeFactor } from '../lib/maps';

describe('Maps Utility Functions', () => {
  describe('calculateDynamicPrice', () => {
    it('should calculate correct price with normal factors', () => {
      const price = calculateDynamicPrice(2, 1.0, 1.0, 60);
      expect(price).toBe(120); // 2 * 1.0 * 1.0 * 60
    });

    it('should handle peak hour pricing', () => {
      const price = calculateDynamicPrice(2, 1.5, 1.5, 60);
      expect(price).toBe(270); // 2 * 1.5 * 1.5 * 60
    });
  });

  describe('getDemandFactor', () => {
    it('should return 2.0 for very high demand', () => {
      const factor = getDemandFactor(5, 100); // 95% occupied
      expect(factor).toBe(2.0);
    });

    it('should return 1.0 for low demand', () => {
      const factor = getDemandFactor(80, 100); // 20% occupied
      expect(factor).toBe(1.0);
    });
  });
});