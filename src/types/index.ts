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
  price?: number; // Added to support Supabase product structure
}

export interface SmartphoneProduct extends Product {
  specifications: {
    ram: string; // e.g., "4GB", "8GB"
    processor: string; // e.g., "Snapdragon 888", "A15 Bionic"
    storage: string; // e.g., "64GB", "128GB"
    display: string; // e.g., "6.1 inch OLED" or "120Hz"
    camera: string; // e.g., "12MP dual camera" or "48MP"
    battery: string; // e.g., "4000mAh"
    os?: string; // e.g., "iOS 16", "Android 13"
    color?: string; // e.g., "Silver", "Midnight Black"
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

// Smartphone specific input data format
export interface SmartphoneInputData {
  Brand: string;
  Model: string;
  Price: string | number;
  "Original Price": string | number;
  Stock: number;
  Category: string;
  Specifications: {
    Storage: string;
    RAM: string;
    "Processor Type": string;
    "Display Hz": number;
    "Camera MP": number;
    "Battery Capacity": string;
    OS?: string;
    Color?: string;
  };
  "Month of Sale"?: string;
  "Seasonal Effect"?: number;
  "Competitor Price"?: number;
  "Demand Level"?: number;
  year_of_sale?: number; // Added this property
}

// SupabaseProduct represents the product as stored in Supabase
export interface SupabaseProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  margin?: number;
  sku: string;
  seasonality?: string;
  demand?: string;
  trend?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}
