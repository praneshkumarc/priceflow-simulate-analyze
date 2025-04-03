
import { 
  Product, 
  ProductSale, 
  CompetitorPrice, 
  Category, 
  PriceFactors,
  PricePrediction,
  SimulationParams,
  SimulationResult,
  SalesTrend
} from "@/types";
import { initializeMockData } from "./mockData";

class DataService {
  private products: Product[] = [];
  private sales: ProductSale[] = [];
  private competitorPrices: CompetitorPrice[] = [];
  private categories: Category[] = [];
  
  constructor() {
    this.loadData();
  }
  
  private loadData(): void {
    const mockData = initializeMockData();
    this.products = mockData.products;
    this.sales = mockData.sales;
    this.competitorPrices = mockData.competitorPrices;
    this.categories = mockData.categories;
  }
  
  // Product methods
  public getAllProducts(): Product[] {
    return [...this.products];
  }
  
  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }
  
  public getProductsByCategory(category: string): Product[] {
    return this.products.filter(p => p.category === category);
  }
  
  // Sales methods
  public getAllSales(): ProductSale[] {
    return [...this.sales];
  }
  
  public getProductSales(productId: string): ProductSale[] {
    return this.sales.filter(s => s.productId === productId);
  }
  
  public getSalesTrends(productId?: string, startDate?: string, endDate?: string): SalesTrend[] {
    // Filter sales by product if provided
    let filteredSales = productId 
      ? this.sales.filter(s => s.productId === productId)
      : this.sales;
    
    // Filter by date range if provided
    if (startDate) {
      filteredSales = filteredSales.filter(s => new Date(s.date) >= new Date(startDate));
    }
    if (endDate) {
      filteredSales = filteredSales.filter(s => new Date(s.date) <= new Date(endDate));
    }
    
    // Group by date
    const salesByDate = filteredSales.reduce((acc, sale) => {
      if (!acc[sale.date]) {
        acc[sale.date] = {
          totalSales: 0,
          totalRevenue: 0
        };
      }
      acc[sale.date].totalSales += sale.quantity;
      acc[sale.date].totalRevenue += sale.quantity * sale.price;
      return acc;
    }, {} as Record<string, { totalSales: number; totalRevenue: number }>);
    
    // Convert to array and sort by date
    return Object.entries(salesByDate)
      .map(([date, data]) => ({
        date,
        sales: data.totalSales,
        revenue: Math.round(data.totalRevenue * 100) / 100
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  // Category methods
  public getAllCategories(): Category[] {
    return [...this.categories];
  }
  
  public getCategoryById(id: string): Category | undefined {
    return this.categories.find(c => c.id === id);
  }
  
  // Competitor price methods
  public getCompetitorPrices(productId: string): CompetitorPrice[] {
    return this.competitorPrices.filter(cp => cp.productId === productId);
  }
  
  public getAverageCompetitorPrice(productId: string): number {
    const prices = this.competitorPrices.filter(cp => cp.productId === productId);
    if (prices.length === 0) return 0;
    
    const sum = prices.reduce((total, cp) => total + cp.price, 0);
    return Math.round((sum / prices.length) * 100) / 100;
  }
  
  // Prediction methods
  public predictOptimalPrice(productId: string): PricePrediction | null {
    const product = this.getProductById(productId);
    if (!product) return null;
    
    // Get sales for this product
    const productSales = this.getProductSales(productId);
    if (productSales.length === 0) return null;
    
    // Calculate demand coefficient based on sales volume
    const totalSold = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const demandCoefficient = Math.min(Math.max(totalSold / 100, 0.1), 1); // Normalized between 0.1 and 1
    
    // Calculate competitor influence
    const avgCompetitorPrice = this.getAverageCompetitorPrice(productId);
    const competitorInfluence = avgCompetitorPrice > 0 
      ? Math.min(Math.max((avgCompetitorPrice / product.basePrice) - 0.9, -0.2), 0.2)
      : 0;
    
    // Use product's seasonality factor
    const seasonalityFactor = product.seasonality;
    
    // Calculate margin optimization factor
    const margin = (product.basePrice - product.cost) / product.basePrice;
    const marginOptimization = Math.min(Math.max(margin - 0.3, -0.15), 0.15);
    
    // Calculate optimal price using the formula: P_opt = P_base + f(D,C,T,M)
    // Here, f() is implemented as a weighted sum
    const pricingFunction = (d: number, c: number, t: number, m: number): number => {
      return product.basePrice * (1 + 0.2*d + 0.3*c + 0.25*t + 0.25*m);
    };
    
    const optimalPrice = pricingFunction(
      demandCoefficient, 
      competitorInfluence, 
      seasonalityFactor, 
      marginOptimization
    );
    
    const factors: PriceFactors = {
      demandCoefficient,
      competitorInfluence,
      seasonalityFactor,
      marginOptimization
    };
    
    // Calculate confidence level based on amount of data
    const confidence = Math.min(productSales.length / 50, 1) * 100;
    
    return {
      productId,
      basePrice: product.basePrice,
      optimalPrice: Math.round(optimalPrice * 100) / 100,
      confidence: Math.round(confidence),
      factors
    };
  }
  
  // Simulation methods
  public simulateDiscount(params: SimulationParams): SimulationResult {
    const product = this.getProductById(params.productId);
    if (!product) {
      throw new Error("Product not found");
    }
    
    // Get sales history for elasticity calculation
    const productSales = this.getProductSales(params.productId);
    
    // Calculate price elasticity (simplified)
    // Average price and quantity from historical data
    let avgPrice = 0;
    let avgQuantity = 0;
    
    if (productSales.length > 0) {
      avgPrice = productSales.reduce((sum, sale) => sum + sale.price, 0) / productSales.length;
      avgQuantity = productSales.reduce((sum, sale) => sum + sale.quantity, 0) / productSales.length;
    } else {
      avgPrice = product.basePrice;
      avgQuantity = 5; // Default assumption
    }
    
    // Calculate discounted price
    const discountedPrice = product.basePrice * (1 - params.discountRate);
    
    // Estimate demand increase based on discount and elasticity
    const priceChangePercent = (avgPrice - discountedPrice) / avgPrice;
    const elasticity = -1.5; // Assumed elasticity, negative because price and demand are inversely related
    const quantityChangePercent = priceChangePercent * elasticity;
    
    // Expected sales with the applied discount
    const expectedSales = avgQuantity * (1 + quantityChangePercent) * 
      (params.expectedDemandIncrease > 0 ? params.expectedDemandIncrease : 1);
    
    // Calculate expected revenue and profit
    const expectedRevenue = expectedSales * discountedPrice;
    const expectedProfit = expectedSales * (discountedPrice - product.cost);
    
    return {
      productId: params.productId,
      originalPrice: product.basePrice,
      discountedPrice: Math.round(discountedPrice * 100) / 100,
      expectedSales: Math.round(expectedSales * 100) / 100,
      expectedRevenue: Math.round(expectedRevenue * 100) / 100,
      expectedProfit: Math.round(expectedProfit * 100) / 100
    };
  }
  
  // Top sellers by revenue
  public getTopSellingProducts(limit: number = 5): { product: Product; revenue: number; units: number }[] {
    // Group sales by product
    const productTotals = this.sales.reduce((acc, sale) => {
      if (!acc[sale.productId]) {
        acc[sale.productId] = { revenue: 0, units: 0 };
      }
      acc[sale.productId].revenue += sale.price * sale.quantity;
      acc[sale.productId].units += sale.quantity;
      return acc;
    }, {} as Record<string, { revenue: number; units: number }>);
    
    // Convert to array of products with revenue
    const productsWithRevenue = Object.entries(productTotals).map(([productId, data]) => {
      const product = this.getProductById(productId);
      return {
        product: product!,
        revenue: Math.round(data.revenue * 100) / 100,
        units: data.units
      };
    });
    
    // Sort by revenue and return top N
    return productsWithRevenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }
}

export const dataService = new DataService();
