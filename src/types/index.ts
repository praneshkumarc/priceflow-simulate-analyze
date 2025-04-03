
// Product Data Types
export interface Product {
  id: string;
  name: string;
  basePrice: number;
  category: string;
  inventory: number;
  cost: number;
  seasonality: number; // 0-1 value indicating seasonality impact
}

export interface ProductSale {
  id: string;
  productId: string;
  date: string;
  quantity: number;
  price: number;
}

export interface CompetitorPrice {
  productId: string;
  competitorName: string;
  price: number;
  date: string;
}

export interface PriceFactors {
  demandCoefficient: number; // D
  competitorInfluence: number; // C
  seasonalityFactor: number; // T
  marginOptimization: number; // M
}

// Category types
export interface Category {
  id: string;
  name: string;
  description: string;
  pricingRules: PricingRule[];
}

export interface PricingRule {
  id: string;
  name: string;
  description: string;
  formula: string;
}

// Simulation types
export interface SimulationParams {
  productId: string;
  discountRate: number;
  startDate: string;
  endDate: string;
  expectedDemandIncrease: number;
}

export interface SimulationResult {
  productId: string;
  originalPrice: number;
  discountedPrice: number;
  expectedSales: number;
  expectedRevenue: number;
  expectedProfit: number;
}

// Analysis types
export interface SalesTrend {
  date: string;
  sales: number;
  revenue: number;
}

export interface PricePrediction {
  productId: string;
  basePrice: number;
  optimalPrice: number;
  confidence: number;
  factors: PriceFactors;
}
