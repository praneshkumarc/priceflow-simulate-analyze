
import { Product, PricePrediction } from "@/types";

class PredictionService {
  private predictedPrices: Record<string, number> = {};
  private predictedProducts: Record<string, PricePrediction> = {};

  public savePrediction(prediction: PricePrediction): void {
    this.predictedPrices[prediction.productId] = prediction.optimalPrice;
    this.predictedProducts[prediction.productId] = prediction;
  }

  public getPredictedPrice(productId: string): number | undefined {
    return this.predictedPrices[productId];
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
  }

  public clearAllPredictions(): void {
    this.predictedPrices = {};
    this.predictedProducts = {};
  }
}

export const predictionService = new PredictionService();
