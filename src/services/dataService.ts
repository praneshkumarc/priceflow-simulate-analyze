import { 
  Product, 
  ProductSale, 
  CompetitorPrice, 
  Category, 
  PriceFactors,
  PricePrediction,
  SimulationParams,
  SimulationResult,
  SalesTrend,
  SmartphoneProduct,
  SmartphoneInputData
} from "@/types";
import { initializeMockData } from "./mockData";

class DataService {
  private products: Product[] = [];
  private sales: ProductSale[] = [];
  private competitorPrices: CompetitorPrice[] = [];
  private categories: Category[] = [];
  private dataset: SmartphoneInputData[] | null = null;
  
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
  
  // Method to get the dataset
  public getDataset(): SmartphoneInputData[] | null {
    return this.dataset;
  }
  
  // Method to update dataset with uploaded data
  public updateDataset(data: SmartphoneInputData[]): void {
    this.dataset = data;
  }
  
  // Method to add a new product 
  public addProduct(productData: SmartphoneInputData): void {
    // Generate a unique ID for the new product
    const productId = `product-${Date.now()}`;
    
    // Create the base product object
    const newProduct: Product = {
      id: productId,
      name: `${productData.Brand} ${productData.Model}`,
      basePrice: typeof productData.Price === 'string' ? parseFloat(productData.Price) : productData.Price,
      category: productData.Category,
      inventory: productData.Stock || 10,
      cost: typeof productData["Original Price"] === 'string' ? 
        parseFloat(productData["Original Price"]) : 
        (productData["Original Price"] || 0),
      seasonality: productData["Seasonal Effect"] ? productData["Seasonal Effect"] / 10 : 0.5,
      specifications: {
        ...productData.Specifications,
        brand: productData.Brand,
        model: productData.Model
      }
    };
    
    // Add to products array
    this.products.push(newProduct);
    
    // Generate sample sales data for the new product
    this.generateSalesDataForProduct(productId, productData);
    
    // Add competitor price if available
    if (productData["Competitor Price"]) {
      this.addCompetitorPrice(productId, productData["Competitor Price"]);
    }
    
    // Update dataset to include the new product
    if (this.dataset) {
      this.dataset.push(productData);
    } else {
      this.dataset = [productData];
    }
  }
  
  // Method to generate sales data for a specific product
  private generateSalesDataForProduct(productId: string, productData: SmartphoneInputData): void {
    const now = new Date();
    const basePrice = typeof productData.Price === 'string' ? parseFloat(productData.Price) : productData.Price;
    
    // Generate between 5-15 sales
    const salesCount = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < salesCount; i++) {
      // Random date in the last 90 days
      const date = new Date();
      date.setDate(now.getDate() - Math.floor(Math.random() * 90));
      
      // Random quantity between 1-5
      const quantity = Math.floor(Math.random() * 5) + 1;
      
      // Price with minor variations around the base price
      const variation = (Math.random() * 0.2) - 0.1; // -10% to +10%
      const price = basePrice * (1 + variation);
      
      this.sales.push({
        id: `sale-${this.sales.length + 1}`,
        productId: productId,
        date: date.toISOString().split('T')[0],
        quantity,
        price: Math.round(price * 100) / 100
      });
    }
    
    // Sort by date, newest first
    this.sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  // Method to add a competitor price for a product
  private addCompetitorPrice(productId: string, price: number): void {
    const competitors = ['CompetitorA', 'CompetitorB', 'CompetitorC'];
    
    // Random competitor
    const competitor = competitors[Math.floor(Math.random() * competitors.length)];
    
    this.competitorPrices.push({
      productId: productId,
      competitorName: competitor,
      price: Math.round(price * 100) / 100,
      date: new Date().toISOString().split('T')[0]
    });
  }
  
  // Method to update products with uploaded data
  public updateProducts(newProducts: Product[]): void {
    // Replace the existing products with the new ones
    this.products = [...newProducts];
    
    // Generate new sales data based on the new products
    this.generateSalesData();
    
    // Generate new competitor prices
    this.generateCompetitorPrices();
  }
  
  // Generate sample sales data for the new products
  private generateSalesData(): void {
    this.sales = [];
    
    // For each product, generate some sample sales over the last 90 days
    this.products.forEach(product => {
      const now = new Date();
      
      // Generate between 10-30 sales per product
      const salesCount = Math.floor(Math.random() * 20) + 10;
      
      for (let i = 0; i < salesCount; i++) {
        // Random date in the last 90 days
        const date = new Date();
        date.setDate(now.getDate() - Math.floor(Math.random() * 90));
        
        // Random quantity between 1-10
        const quantity = Math.floor(Math.random() * 10) + 1;
        
        // Price with minor variations around the base price
        const variation = (Math.random() * 0.2) - 0.1; // -10% to +10%
        const price = product.basePrice * (1 + variation);
        
        this.sales.push({
          id: `sale-${this.sales.length + 1}`,
          productId: product.id,
          date: date.toISOString().split('T')[0],
          quantity,
          price: Math.round(price * 100) / 100
        });
      }
    });
    
    // Sort by date, newest first
    this.sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  // Generate sample competitor prices
  private generateCompetitorPrices(): void {
    this.competitorPrices = [];
    
    const competitors = ['CompetitorA', 'CompetitorB', 'CompetitorC'];
    
    this.products.forEach(product => {
      competitors.forEach(competitor => {
        // Random variation from product's base price
        const variation = (Math.random() * 0.3) - 0.15; // -15% to +15%
        const price = product.basePrice * (1 + variation);
        
        this.competitorPrices.push({
          productId: product.id,
          competitorName: competitor,
          price: Math.round(price * 100) / 100,
          date: new Date().toISOString().split('T')[0]
        });
      });
    });
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
  
  public getProductsByModel(model: string): Product[] {
    return this.products.filter(p => 
      p.specifications && p.specifications.model === model
    );
  }
  
  // Get unique values from dataset
  public getUniqueValuesFromDataset(field: string): string[] {
    if (!this.dataset || this.dataset.length === 0) {
      return [];
    }
    
    const values = new Set<string>();
    
    this.dataset.forEach(item => {
      const value = (item as any)[field];
      if (value) {
        values.add(value.toString());
      }
    });
    
    return Array.from(values);
  }
  
  // Price prediction using KNN algorithm
  public predictPrice(model: string, basePrice: number, profitMargin: number): number {
    if (!this.dataset || this.dataset.length === 0) {
      return basePrice; // Default to base price if no dataset
    }
    
    // Filter dataset to find entries with matching model
    const matchingEntries = this.dataset.filter(item => item.Model === model);
    
    if (matchingEntries.length === 0) {
      return basePrice; // Default to base price if no matches
    }
    
    // Normalize competitor prices
    const normalizedEntries = this.normalizeCompetitorPrices(matchingEntries);
    
    // Extract features for KNN
    const features = this.extractFeatures(normalizedEntries[0]);
    
    // Find K nearest neighbors (use K=3 or dataset length if smaller)
    const k = Math.min(3, normalizedEntries.length);
    const neighbors = this.findKNearestNeighbors(normalizedEntries, features, k);
    
    // Calculate predicted price based on neighbors
    let predictedPrice = 0;
    let totalWeight = 0;
    
    neighbors.forEach(neighbor => {
      const price = typeof neighbor.entry.Price === 'string' ? 
        parseFloat(neighbor.entry.Price) : neighbor.entry.Price;
      
      const weight = 1 / (neighbor.distance + 0.1); // Add 0.1 to avoid division by zero
      predictedPrice += price * weight;
      totalWeight += weight;
    });
    
    predictedPrice = predictedPrice / totalWeight;
    
    // Adjust based on profit margin
    const costFactor = 1 - (profitMargin / 100);
    const adjustedPrice = predictedPrice / costFactor;
    
    return Math.round(adjustedPrice * 100) / 100;
  }
  
  // Normalize competitor prices in dataset
  private normalizeCompetitorPrices(entries: SmartphoneInputData[]): SmartphoneInputData[] {
    // Group entries by competitor price
    const priceGroups: Record<number, SmartphoneInputData[]> = {};
    
    entries.forEach(entry => {
      if (entry["Competitor Price"]) {
        const price = entry["Competitor Price"];
        if (!priceGroups[price]) {
          priceGroups[price] = [];
        }
        priceGroups[price].push(entry);
      }
    });
    
    // For each group with identical prices, keep only one entry
    const normalizedEntries: SmartphoneInputData[] = [];
    
    Object.values(priceGroups).forEach(group => {
      normalizedEntries.push(group[0]);
    });
    
    // Add entries without competitor prices
    entries.forEach(entry => {
      if (!entry["Competitor Price"]) {
        normalizedEntries.push(entry);
      }
    });
    
    return normalizedEntries;
  }
  
  // Extract features from dataset entry
  private extractFeatures(entry: SmartphoneInputData): Record<string, number> {
    const features: Record<string, number> = {};
    
    // Extract numerical features
    if (entry.Specifications) {
      features.storage = this.extractStorageGB(entry.Specifications.Storage);
      features.ram = this.extractRAMGB(entry.Specifications.RAM);
      features.display = entry.Specifications["Display Hz"] || 60;
      features.camera = entry.Specifications["Camera MP"] || 12;
      features.battery = this.extractBatteryCapacity(entry.Specifications["Battery Capacity"]);
    }
    
    // Other numerical features
    features.stock = entry.Stock || 10;
    features.seasonalEffect = entry["Seasonal Effect"] || 5;
    features.demandLevel = entry["Demand Level"] || 5;
    
    return features;
  }
  
  // Helper to extract storage in GB
  private extractStorageGB(storage: string): number {
    if (!storage) return 64; // Default value
    
    const match = storage.match(/(\d+)\s*GB/i);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    
    const tbMatch = storage.match(/(\d+)\s*TB/i);
    if (tbMatch && tbMatch[1]) {
      return parseInt(tbMatch[1]) * 1024; // Convert TB to GB
    }
    
    return 64; // Default value
  }
  
  // Helper to extract RAM in GB
  private extractRAMGB(ram: string): number {
    if (!ram) return 4; // Default value
    
    const match = ram.match(/(\d+)\s*GB/i);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    
    return 4; // Default value
  }
  
  // Helper to extract battery capacity in mAh
  private extractBatteryCapacity(battery: string): number {
    if (!battery) return 3000; // Default value
    
    const match = battery.match(/(\d+)\s*mAh/i);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    
    return 3000; // Default value
  }
  
  // Find K nearest neighbors using Euclidean distance
  private findKNearestNeighbors(
    entries: SmartphoneInputData[], 
    targetFeatures: Record<string, number>, 
    k: number
  ): { entry: SmartphoneInputData; distance: number }[] {
    // Calculate distance for each entry
    const entriesWithDistance = entries.map(entry => {
      const features = this.extractFeatures(entry);
      const distance = this.calculateEuclideanDistance(features, targetFeatures);
      return { entry, distance };
    });
    
    // Sort by distance (ascending) and take top K
    return entriesWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }
  
  // Calculate Euclidean distance between feature sets
  private calculateEuclideanDistance(
    features1: Record<string, number>, 
    features2: Record<string, number>
  ): number {
    let sum = 0;
    
    // Normalize and weight features
    const weights = {
      storage: 0.2,
      ram: 0.2,
      display: 0.15,
      camera: 0.15,
      battery: 0.1,
      stock: 0.05,
      seasonalEffect: 0.1,
      demandLevel: 0.1
    };
    
    // For each feature in features1
    Object.keys(features1).forEach(key => {
      if (features2[key] !== undefined) {
        const weight = (weights as any)[key] || 1;
        const diff = features1[key] - features2[key];
        sum += weight * diff * diff;
      }
    });
    
    return Math.sqrt(sum);
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
      if (!product) {
        return null;
      }
      return {
        product,
        revenue: Math.round(data.revenue * 100) / 100,
        units: data.units
      };
    }).filter(item => item !== null) as { product: Product; revenue: number; units: number }[];
    
    // Sort by revenue and return top N
    return productsWithRevenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }
}

export const dataService = new DataService();
