
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

  // Tests for the new KNN functionality
  describe('KNN Functionality', () => {
    beforeEach(() => {
      // Set up test dataset
      predictionService.clearDataset();
      predictionService.setDataset([
        { features: [0.4, 0.5, 0.6, 0.7, 0.3], price: 499, cost: 299 },
        { features: [0.7, 0.6, 0.7, 0.6, 0.5], price: 699, cost: 399 },
        { features: [0.9, 0.8, 0.8, 0.7, 0.7], price: 899, cost: 499 },
        { features: [0.2, 0.3, 0.4, 0.5, 0.2], price: 399, cost: 229 },
        { features: [0.8, 0.7, 0.9, 0.6, 0.6], price: 799, cost: 449 }
      ]);
    });

    it('predicts price using KNN algorithm', () => {
      const features = [0.5, 0.5, 0.6, 0.6, 0.4];
      const result = predictionService.predictPriceWithKNN(features, 3);
      
      // We expect the prediction to be reasonable based on our test dataset
      expect(result.predictedPrice).toBeGreaterThan(450);
      expect(result.predictedPrice).toBeLessThan(750);
      
      // Confidence should be between defined bounds
      expect(result.confidence).toBeGreaterThanOrEqual(65);
      expect(result.confidence).toBeLessThanOrEqual(95);
    });

    it('normalizes features correctly', () => {
      const features = [8, 7, 128, 6.1, 3];
      const minValues = [4, 4, 64, 5.4, 0];
      const maxValues = [16, 10, 512, 6.7, 5];
      
      const normalized = predictionService.normalizeFeatures(features, minValues, maxValues);
      
      // Check each normalized feature is between 0 and 1
      normalized.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
      
      // Check specific values
      expect(normalized[0]).toBeCloseTo(0.33, 1); // (8-4)/(16-4)
      expect(normalized[1]).toBeCloseTo(0.5, 1);  // (7-4)/(10-4)
    });

    it('extracts smartphone features correctly', () => {
      const specs = {
        ram: '8GB',
        processor: 'Snapdragon 888',
        storage: '128GB',
        display: '6.1 inch OLED',
        camera: '48MP dual camera',
        battery: '4500mAh'
      };
      
      const features = predictionService.extractSmartphoneFeatures(specs);
      
      // Should have 5 features
      expect(features.length).toBe(5);
      
      // All features should be normalized between 0 and 1
      features.forEach(feature => {
        expect(feature).toBeGreaterThanOrEqual(0);
        expect(feature).toBeLessThanOrEqual(1);
      });
    });

    it('throws error when there are not enough data points for KNN', () => {
      predictionService.clearDataset();
      predictionService.addDataPoint([0.5, 0.5, 0.5, 0.5, 0.5], 599);
      
      const features = [0.6, 0.6, 0.6, 0.6, 0.6];
      
      // Should throw an error when k=3 but we only have 1 data point
      expect(() => predictionService.predictPriceWithKNN(features, 3)).toThrow();
    });
  });
});
