
import { Product, PricePrediction } from "@/types";

class PredictionService {
  private predictedPrices: Record<string, number> = {};
  private predictedProducts: Record<string, PricePrediction> = {};
  private productCosts: Record<string, number> = {}; // Added to track product costs

  public savePrediction(prediction: PricePrediction): void {
    this.predictedPrices[prediction.productId] = prediction.optimalPrice;
    this.predictedProducts[prediction.productId] = prediction;
    
    // Store the product cost
    this.productCosts[prediction.productId] = prediction.productCost;
    
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
}

export const predictionService = new PredictionService();
