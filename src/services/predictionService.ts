
import { Product, PricePrediction } from "@/types";

class PredictionService {
  private predictedPrices: Record<string, number> = {};
  private predictedProducts: Record<string, PricePrediction> = {};
  private productCosts: Record<string, number> = {}; 
  private dataset: Array<{
    features: number[],
    price: number,
    cost?: number
  }> = [];

  constructor() {
    // Initialize with some sample data points for KNN to work with
    this.dataset = [
      { features: [4, 0.7, 0.6, 0.5], price: 599, cost: 350 },
      { features: [8, 0.8, 0.7, 0.6], price: 799, cost: 450 },
      { features: [6, 0.6, 0.5, 0.4], price: 699, cost: 400 },
      { features: [12, 0.9, 0.8, 0.7], price: 999, cost: 600 },
      { features: [3, 0.5, 0.4, 0.3], price: 499, cost: 300 },
    ];
  }

  public savePrediction(prediction: PricePrediction): void {
    this.predictedPrices[prediction.productId] = prediction.optimalPrice;
    this.predictedProducts[prediction.productId] = prediction;
    
    // If the prediction contains cost information, store it
    if (prediction.productCost !== undefined) {
      this.productCosts[prediction.productId] = prediction.productCost;
    }
    
    console.log("Prediction saved:", prediction);
    console.log("Current predictions:", this.predictedPrices);
  }
  
  public saveProductCost(productId: string, cost: number): void {
    this.productCosts[productId] = cost;
  }

  public getProductCost(productId: string): number | undefined {
    return this.productCosts[productId];
  }

  public getPredictedPrice(productId: string): number | undefined {
    return this.predictedPrices[productId];
  }

  public getPredictionDetails(productId: string): PricePrediction | undefined {
    return this.predictedProducts[productId];
  }

  public getPredictedProducts(): Record<string, PricePrediction> {
    return { ...this.predictedProducts };
  }

  public getPredictedProductIds(): string[] {
    return Object.keys(this.predictedProducts);
  }

  public getProductsWithPredictions(products: Product[]): Product[] {
    return products.filter(product => this.predictedPrices[product.id] !== undefined);
  }

  public getAllPredictedPrices(): Record<string, number> {
    return { ...this.predictedPrices };
  }

  public hasPrediction(productId: string): boolean {
    return this.predictedPrices[productId] !== undefined;
  }

  public clearPrediction(productId: string): void {
    delete this.predictedPrices[productId];
    delete this.predictedProducts[productId];
    delete this.productCosts[productId];
  }

  public clearAllPredictions(): void {
    this.predictedPrices = {};
    this.predictedProducts = {};
    this.productCosts = {};
  }
  
  // Calculate profit for a given price and expected sales
  public calculateProfit(productId: string, price: number, estimatedSales: number): number {
    const cost = this.productCosts[productId];
    
    // If we don't have cost data, estimate it at 50% of the optimal price
    const estimatedCost = cost || (this.predictedPrices[productId] ? this.predictedPrices[productId] * 0.5 : price * 0.5);
    
    return (price - estimatedCost) * estimatedSales;
  }
  
  // Calculate revenue for a given price and expected sales
  public calculateRevenue(price: number, estimatedSales: number): number {
    return price * estimatedSales;
  }

  // Add data point to the KNN dataset
  public addDataPoint(features: number[], price: number, cost?: number): void {
    this.dataset.push({ features, price, cost });
  }

  // Clear all data points in the KNN dataset
  public clearDataset(): void {
    this.dataset = [];
  }

  // Set multiple data points at once
  public setDataset(dataset: Array<{ features: number[], price: number, cost?: number }>): void {
    this.dataset = dataset;
  }

  // Calculate Euclidean distance between two feature vectors
  private calculateDistance(featuresA: number[], featuresB: number[]): number {
    if (featuresA.length !== featuresB.length) {
      throw new Error("Feature vectors must have the same length");
    }
    
    let sum = 0;
    for (let i = 0; i < featuresA.length; i++) {
      sum += Math.pow(featuresA[i] - featuresB[i], 2);
    }
    return Math.sqrt(sum);
  }

  // KNN algorithm to predict price based on features
  public predictPriceWithKNN(features: number[], k: number = 3): { predictedPrice: number, confidence: number } {
    if (this.dataset.length < k) {
      throw new Error(`Not enough data points for k=${k}. Only ${this.dataset.length} available.`);
    }

    // Calculate distances to all data points
    const distances = this.dataset.map(point => ({
      distance: this.calculateDistance(features, point.features),
      price: point.price,
      cost: point.cost
    }));

    // Sort by distance
    distances.sort((a, b) => a.distance - b.distance);

    // Take k nearest neighbors
    const nearestNeighbors = distances.slice(0, k);

    // Calculate weighted average
    const totalWeight = nearestNeighbors.reduce((sum, neighbor) => {
      // Use inverse distance as weight (closer points have higher weights)
      const weight = 1 / (neighbor.distance + 0.00001); // Add small epsilon to avoid division by zero
      return sum + weight;
    }, 0);

    const weightedSum = nearestNeighbors.reduce((sum, neighbor) => {
      const weight = 1 / (neighbor.distance + 0.00001);
      return sum + (neighbor.price * weight);
    }, 0);

    const predictedPrice = weightedSum / totalWeight;

    // Calculate confidence based on variance of nearest neighbors
    const meanPrice = nearestNeighbors.reduce((sum, n) => sum + n.price, 0) / k;
    const variance = nearestNeighbors.reduce((sum, n) => sum + Math.pow(n.price - meanPrice, 2), 0) / k;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation means higher confidence
    // Map to 0-100 range with inverse relationship to standard deviation
    const maxConfidence = 95; // Max confidence percentage
    const minConfidence = 65; // Min confidence percentage
    const confidenceFactor = Math.max(0, 1 - (stdDev / meanPrice));
    const confidence = minConfidence + confidenceFactor * (maxConfidence - minConfidence);

    return { 
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence: Math.round(confidence)
    };
  }

  // Feature normalization function to scale features to 0-1 range
  public normalizeFeatures(features: number[], minValues: number[], maxValues: number[]): number[] {
    if (features.length !== minValues.length || features.length !== maxValues.length) {
      throw new Error("Features and min/max values arrays must have the same length");
    }

    return features.map((value, index) => {
      if (maxValues[index] === minValues[index]) return 0.5; // Avoid division by zero
      return (value - minValues[index]) / (maxValues[index] - minValues[index]);
    });
  }

  // Helper to extract and normalize smartphone features
  public extractSmartphoneFeatures(
    specs: {
      ram: string,
      processor: string,
      storage: string,
      display: string,
      camera?: string,
      battery?: string
    }
  ): number[] {
    // Extract numeric values from specs
    const ramGB = parseInt(specs.ram.replace(/[^0-9]/g, '')) || 4;
    
    // Map processor to a power score (1-10)
    let processorScore = 5;
    if (specs.processor.includes('A15') || specs.processor.includes('A16')) {
      processorScore = 9;
    } else if (specs.processor.includes('A14')) {
      processorScore = 8;
    } else if (specs.processor.includes('Snapdragon 8 Gen')) {
      processorScore = 8;
    } else if (specs.processor.includes('Snapdragon 888')) {
      processorScore = 7;
    } else if (specs.processor.includes('Snapdragon 7')) {
      processorScore = 6;
    } else if (specs.processor.includes('Exynos')) {
      processorScore = 7;
    } else if (specs.processor.includes('MediaTek')) {
      processorScore = 5;
    }
    
    // Storage in GB
    const storageGB = parseInt(specs.storage.replace(/[^0-9]/g, '')) || 64;
    
    // Display size in inches
    const displaySize = parseFloat(specs.display.match(/\d+\.\d+/)?.toString() || '6.1');
    
    // Premium features score (0-5)
    let premiumScore = 0;
    if (specs.display.toLowerCase().includes('amoled')) premiumScore += 1.5;
    else if (specs.display.toLowerCase().includes('oled')) premiumScore += 1;
    
    if (specs.display.toLowerCase().includes('ltpo')) premiumScore += 1;
    
    if (specs.camera && specs.camera.includes('MP')) {
      const mpMatch = specs.camera.match(/(\d+)MP/);
      if (mpMatch && parseInt(mpMatch[1]) > 20) premiumScore += 1;
    }
    
    if (specs.battery && specs.battery.includes('mAh')) {
      const mAhMatch = specs.battery.match(/(\d+)mAh/);
      if (mAhMatch && parseInt(mAhMatch[1]) > 4000) premiumScore += 0.5;
    }
    
    // Return normalized features
    const features = [ramGB, processorScore, storageGB, displaySize, premiumScore];
    
    // Normalize using predefined min/max values
    const minValues = [2, 4, 32, 5.4, 0];
    const maxValues = [16, 10, 1024, 7.0, 5];
    
    return this.normalizeFeatures(features, minValues, maxValues);
  }
}

export const predictionService = new PredictionService();
