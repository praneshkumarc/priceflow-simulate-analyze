
import { Product, ProductSale, CompetitorPrice, Category } from "@/types";

// Helper to generate random number within a range
const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Helper to get a random date within the last year
const randomDate = (start: Date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)): string => {
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

// Generate mock products
export const generateMockProducts = (count: number = 20): Product[] => {
  const categories = ['Electronics', 'Clothing', 'Home Goods', 'Beauty', 'Food'];
  
  return Array(count).fill(null).map((_, index) => ({
    id: `p-${index + 1}`,
    name: `Product ${index + 1}`,
    basePrice: Math.round(randomInRange(10, 500) * 100) / 100,
    category: categories[Math.floor(Math.random() * categories.length)],
    inventory: Math.floor(randomInRange(0, 200)),
    cost: Math.round(randomInRange(5, 250) * 100) / 100,
    seasonality: Math.round(randomInRange(0, 1) * 100) / 100
  }));
};

// Generate mock sales data
export const generateMockSales = (products: Product[], count: number = 1000): ProductSale[] => {
  return Array(count).fill(null).map((_, index) => {
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(randomInRange(1, 10));
    const priceVariation = randomInRange(0.9, 1.1);
    
    return {
      id: `s-${index + 1}`,
      productId: product.id,
      date: randomDate(),
      quantity,
      price: Math.round(product.basePrice * priceVariation * 100) / 100
    };
  });
};

// Generate mock competitor prices
export const generateMockCompetitorPrices = (products: Product[], count: number = 100): CompetitorPrice[] => {
  const competitors = ['CompA', 'CompB', 'CompC'];
  
  return Array(count).fill(null).map((_, index) => {
    const product = products[Math.floor(Math.random() * products.length)];
    const competitor = competitors[Math.floor(Math.random() * competitors.length)];
    const priceVariation = randomInRange(0.8, 1.2);
    
    return {
      productId: product.id,
      competitorName: competitor,
      price: Math.round(product.basePrice * priceVariation * 100) / 100,
      date: randomDate()
    };
  });
};

// Generate mock categories with pricing rules
export const generateMockCategories = (): Category[] => {
  return [
    {
      id: "cat-1",
      name: "High Margin",
      description: "Products with high profit margins",
      pricingRules: [
        {
          id: "rule-1",
          name: "Premium Pricing",
          description: "Maintain higher prices due to good margins",
          formula: "basePrice * 1.2"
        }
      ]
    },
    {
      id: "cat-2",
      name: "Competitive Items",
      description: "Products with high competition",
      pricingRules: [
        {
          id: "rule-2",
          name: "Match Competitor",
          description: "Stay close to competitor pricing",
          formula: "min(basePrice, avgCompetitorPrice) * 1.05"
        }
      ]
    },
    {
      id: "cat-3",
      name: "Seasonal Products",
      description: "Products with strong seasonal variations",
      pricingRules: [
        {
          id: "rule-3",
          name: "Seasonal Adjustment",
          description: "Adjust price based on season demand",
          formula: "basePrice * (1 + seasonalityFactor * 0.3)"
        }
      ]
    },
    {
      id: "cat-4",
      name: "Clearance Items",
      description: "Products that need to be cleared from inventory",
      pricingRules: [
        {
          id: "rule-4",
          name: "Inventory Reduction",
          description: "Price lower to clear inventory",
          formula: "basePrice * (0.9 - inventoryRatio * 0.2)"
        }
      ]
    }
  ];
};

// Create and initialize all mock data
export const initializeMockData = () => {
  const products = generateMockProducts(20);
  const sales = generateMockSales(products, 1000);
  const competitorPrices = generateMockCompetitorPrices(products, 100);
  const categories = generateMockCategories();
  
  return {
    products,
    sales,
    competitorPrices,
    categories
  };
};

// Helper function to get sales data for a specific product
export const getProductSales = (productId: string, sales: ProductSale[]): ProductSale[] => {
  return sales.filter(sale => sale.productId === productId);
};
