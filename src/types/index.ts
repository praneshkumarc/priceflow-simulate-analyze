// Product Data Types
export interface Product {
  id: string;
  name: string;
  basePrice: number;
  category: string;
  inventory: number;
  cost: number;
  seasonality: number; // 0-1 value indicating seasonality impact
  specifications?: Record<string, any>; // For storing additional specs
}

export interface SmartphoneProduct extends Product {
  specifications: {
    ram: string; // e.g., "4GB", "8GB"
    processor: string; // e.g., "Snapdragon 888", "A15 Bionic"
    storage: string; // e.g., "64GB", "128GB"
    display: string; // e.g., "6.1 inch OLED"
    camera: string; // e.g., "12MP dual camera"
    battery: string; // e.g., "4000mAh"
  };
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

// Data processing types
export interface DatasetUpload {
  id: string;
  name: string;
  dateUploaded: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  rowCount: number;
  productCount: number;
}

export interface MLModelParams {
  learningRate: number;
  epochs: number;
  features: string[];
  targetVariable: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}
