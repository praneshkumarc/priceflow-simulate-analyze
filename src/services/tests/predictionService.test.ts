
import { describe, it, expect, beforeEach } from 'vitest';
import { predictionService } from '@/services/predictionService';
import { PricePrediction } from '@/types';

describe('predictionService', () => {
  const mockPrediction: PricePrediction = {
    productId: 'prod-123',
    basePrice: 500,
    optimalPrice: 599.99,
    confidence: 0.85,
    factors: {
      demandCoefficient: 0.8,
      competitorInfluence: 0.2,
      seasonalityFactor: 0.5,
      marginOptimization: 0.6
    },
    productCost: 300
  };

  beforeEach(() => {
    // Clear all predictions before each test
    predictionService.clearAllPredictions();
  });

  it('saves and retrieves price predictions correctly', () => {
    predictionService.savePrediction(mockPrediction);
    
    // Test retrieval methods
    expect(predictionService.getPredictedPrice('prod-123')).toBe(599.99);
    expect(predictionService.getPredictionDetails('prod-123')).toEqual(mockPrediction);
    expect(predictionService.getPredictedProductIds()).toEqual(['prod-123']);
    expect(predictionService.hasPrediction('prod-123')).toBe(true);
    expect(predictionService.hasPrediction('nonexistent')).toBe(false);
  });

  it('retrieves all predicted prices', () => {
    predictionService.savePrediction(mockPrediction);
    
    const anotherPrediction: PricePrediction = {
      ...mockPrediction,
      productId: 'prod-456',
      optimalPrice: 799.99
    };
    
    predictionService.savePrediction(anotherPrediction);
    
    const allPrices = predictionService.getAllPredictedPrices();
    expect(allPrices).toEqual({
      'prod-123': 599.99,
      'prod-456': 799.99
    });
  });

  it('clears a specific prediction', () => {
    predictionService.savePrediction(mockPrediction);
    
    const anotherPrediction: PricePrediction = {
      ...mockPrediction,
      productId: 'prod-456',
      optimalPrice: 799.99
    };
    
    predictionService.savePrediction(anotherPrediction);
    
    // Clear first prediction
    predictionService.clearPrediction('prod-123');
    
    // Check that only the specified prediction was cleared
    expect(predictionService.hasPrediction('prod-123')).toBe(false);
    expect(predictionService.hasPrediction('prod-456')).toBe(true);
  });

  it('saves and retrieves product costs', () => {
    predictionService.saveProductCost('prod-789', 250);
    expect(predictionService.getProductCost('prod-789')).toBe(250);
    
    // Also test extraction from prediction
    predictionService.savePrediction(mockPrediction);
    expect(predictionService.getProductCost('prod-123')).toBe(300);
  });

  it('calculates profit correctly', () => {
    predictionService.savePrediction(mockPrediction);
    
    // Calculate profit: (price - cost) * quantity
    const profit = predictionService.calculateProfit('prod-123', 600, 100);
    
    // Expected: (600 - 300) * 100 = 30,000
    expect(profit).toBe(30000);
  });

  it('calculates profit with estimated cost when actual cost not available', () => {
    // Create prediction without cost
    const predictionWithoutCost: PricePrediction = {
      ...mockPrediction,
      productId: 'prod-no-cost',
      productCost: undefined
    };
    
    predictionService.savePrediction(predictionWithoutCost);
    
    // Should estimate cost at 50% of optimal price (599.99 * 0.5)
    const profit = predictionService.calculateProfit('prod-no-cost', 600, 100);
    
    // Expected: (600 - 299.995) * 100 = approximately 30,000
    expect(profit).toBeCloseTo(30000.5, 0);
  });
});
