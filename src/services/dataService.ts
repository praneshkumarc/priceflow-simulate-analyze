import { Product, ProductSale, CompetitorPrice, PricePrediction, SimulationParams, SimulationResult, SmartphoneInputData } from "@/types";
import * as tf from '@tensorflow/tfjs';

class DataService {
  private products: Product[] = [
    {
      id: '1',
      name: 'Generic T-Shirt',
      basePrice: 25,
      category: 'Apparel',
      inventory: 150,
      cost: 12,
      seasonality: 0.2,
      specifications: {
        color: 'Various',
        size: 'S, M, L',
        material: 'Cotton'
      }
    },
    {
      id: '2',
      name: 'Leather Wallet',
      basePrice: 45,
      category: 'Accessories',
      inventory: 80,
      cost: 20,
      seasonality: 0.1,
      specifications: {
        material: 'Genuine Leather',
        color: 'Black, Brown',
        size: 'Standard'
      }
    },
    {
      id: '3',
      name: 'Ceramic Mug',
      basePrice: 15,
      category: 'Home Goods',
      inventory: 200,
      cost: 7,
      seasonality: 0.3,
      specifications: {
        design: 'Various',
        capacity: '12 oz',
        material: 'Ceramic'
      }
    },
    {
      id: '4',
      name: 'Wireless Mouse',
      basePrice: 30,
      category: 'Electronics',
      inventory: 120,
      cost: 15,
      seasonality: 0.05,
      specifications: {
        connectivity: 'Bluetooth',
        color: 'Black, White',
        dpi: '1600'
      }
    },
    {
      id: '5',
      name: 'Running Shoes',
      basePrice: 80,
      category: 'Footwear',
      inventory: 90,
      cost: 40,
      seasonality: 0.4,
      specifications: {
        size: '7-12',
        color: 'Blue, Gray',
        material: 'Mesh'
      }
    },
    {
      id: '6',
      name: 'Denim Jeans',
      basePrice: 60,
      category: 'Apparel',
      inventory: 110,
      cost: 30,
      seasonality: 0.15,
      specifications: {
        size: '28-36',
        color: 'Blue',
        fit: 'Slim Fit'
      }
    },
    {
      id: '7',
      name: 'Canvas Backpack',
      basePrice: 50,
      category: 'Accessories',
      inventory: 70,
      cost: 25,
      seasonality: 0.25,
      specifications: {
        color: 'Green, Beige',
        capacity: '20L',
        material: 'Canvas'
      }
    },
    {
      id: '8',
      name: 'Glass Vase',
      basePrice: 20,
      category: 'Home Goods',
      inventory: 180,
      cost: 10,
      seasonality: 0.35,
      specifications: {
        design: 'Clear',
        height: '10 inches',
        material: 'Glass'
      }
    },
    {
      id: '9',
      name: 'USB Keyboard',
      basePrice: 40,
      category: 'Electronics',
      inventory: 100,
      cost: 20,
      seasonality: 0.1,
      specifications: {
        connectivity: 'USB',
        color: 'Black',
        type: 'Mechanical'
      }
    },
    {
      id: '10',
      name: 'Hiking Boots',
      basePrice: 90,
      category: 'Footwear',
      inventory: 60,
      cost: 45,
      seasonality: 0.45,
      specifications: {
        size: '7-12',
        color: 'Brown',
        material: 'Leather'
      }
    }
  ];
  private productSales: ProductSale[] = [
    {
      id: 'sale1',
      productId: '1',
      date: '2024-01-01',
      quantity: 10,
      price: 25
    },
    {
      id: 'sale2',
      productId: '1',
      date: '2024-01-08',
      quantity: 8,
      price: 25
    },
    {
      id: 'sale3',
      productId: '1',
      date: '2024-01-15',
      quantity: 12,
      price: 25
    },
    {
      id: 'sale4',
      productId: '2',
      date: '2024-01-01',
      quantity: 5,
      price: 45
    },
    {
      id: 'sale5',
      productId: '2',
      date: '2024-01-08',
      quantity: 7,
      price: 45
    },
    {
      id: 'sale6',
      productId: '3',
      date: '2024-01-01',
      quantity: 15,
      price: 15
    },
    {
      id: 'sale7',
      productId: '3',
      date: '2024-01-08',
      quantity: 10,
      price: 15
    },
    {
      id: 'sale8',
      productId: '4',
      date: '2024-01-01',
      quantity: 6,
      price: 30
    },
    {
      id: 'sale9',
      productId: '4',
      date: '2024-01-08',
      quantity: 8,
      price: 30
    },
    {
      id: 'sale10',
      productId: '5',
      date: '2024-01-01',
      quantity: 4,
      price: 80
    }
  ];
  private competitorPrices: CompetitorPrice[] = [
    {
      productId: '1',
      competitorName: 'Competitor A',
      price: 27,
      date: '2024-01-01'
    },
    {
      productId: '1',
      competitorName: 'Competitor B',
      price: 26,
      date: '2024-01-01'
    },
    {
      productId: '1',
      competitorName: 'Competitor A',
      price: 28,
      date: '2024-01-15'
    },
    {
      productId: '2',
      competitorName: 'Competitor C',
      price: 47,
      date: '2024-01-01'
    },
    {
      productId: '2',
      competitorName: 'Competitor D',
      price: 46,
      date: '2024-01-01'
    },
    {
      productId: '3',
      competitorName: 'Competitor E',
      price: 16,
      date: '2024-01-01'
    },
    {
      productId: '3',
      competitorName: 'Competitor F',
      price: 15,
      date: '2024-01-01'
    },
    {
      productId: '4',
      competitorName: 'Competitor G',
      price: 32,
      date: '2024-01-01'
    },
    {
      productId: '4',
      competitorName: 'Competitor H',
      price: 31,
      date: '2024-01-01'
    },
    {
      productId: '5',
      competitorName: 'Competitor I',
      price: 82,
      date: '2024-01-01'
    }
  ];
  private dataset: SmartphoneInputData[] = [
    {
      Brand: "Samsung",
      Model: "Galaxy S21",
      Price: 799,
      "Original Price": 999,
      Stock: 150,
      Category: "Smartphones",
      Specifications: {
        Storage: "128GB",
        RAM: "8GB",
        "Processor Type": "Snapdragon 888",
        "Display Hz": 120,
        "Camera MP": 12,
        "Battery Capacity": "4000mAh"
      },
      "Month of Sale": "January",
      "Seasonal Effect": 1.1,
      "Competitor Price": 750,
      "Demand Level": 0.8,
      year_of_sale: 2023
    },
    {
      Brand: "Apple",
      Model: "iPhone 13",
      Price: 899,
      "Original Price": 999,
      Stock: 100,
      Category: "Smartphones",
      Specifications: {
        Storage: "256GB",
        RAM: "6GB",
        "Processor Type": "A15 Bionic",
        "Display Hz": 60,
        "Camera MP": 12,
        "Battery Capacity": "3240mAh"
      },
      "Month of Sale": "January",
      "Seasonal Effect": 1.2,
      "Competitor Price": 850,
      "Demand Level": 0.9,
      year_of_sale: 2023
    },
    {
      Brand: "Google",
      Model: "Pixel 6",
      Price: 699,
      "Original Price": 799,
      Stock: 120,
      Category: "Smartphones",
      Specifications: {
        Storage: "128GB",
        RAM: "8GB",
        "Processor Type": "Tensor",
        "Display Hz": 90,
        "Camera MP": 50,
        "Battery Capacity": "4614mAh"
      },
      "Month of Sale": "January",
      "Seasonal Effect": 1.0,
      "Competitor Price": 650,
      "Demand Level": 0.7,
      year_of_sale: 2023
    },
    {
      Brand: "Samsung",
      Model: "Galaxy S21",
      Price: 799,
      "Original Price": 999,
      Stock: 150,
      Category: "Smartphones",
      Specifications: {
        Storage: "128GB",
        RAM: "8GB",
        "Processor Type": "Snapdragon 888",
        "Display Hz": 120,
        "Camera MP": 12,
        "Battery Capacity": "4000mAh"
      },
      "Month of Sale": "February",
      "Seasonal Effect": 0.9,
      "Competitor Price": 750,
      "Demand Level": 0.8,
      year_of_sale: 2023
    },
    {
      Brand: "Apple",
      Model: "iPhone 13",
      Price: 899,
      "Original Price": 999,
      Stock: 100,
      Category: "Smartphones",
      Specifications: {
        Storage: "256GB",
        RAM: "6GB",
        "Processor Type": "A15 Bionic",
        "Display Hz": 60,
        "Camera MP": 12,
        "Battery Capacity": "3240mAh"
      },
      "Month of Sale": "February",
      "Seasonal Effect": 1.1,
      "Competitor Price": 850,
      "Demand Level": 0.9,
      year_of_sale: 2023
    },
    {
      Brand: "Google",
      Model: "Pixel 6",
      Price: 699,
      "Original Price": 799,
      Stock: 120,
      Category: "Smartphones",
      Specifications: {
        Storage: "128GB",
        RAM: "8GB",
        "Processor Type": "Tensor",
        "Display Hz": 90,
        "Camera MP": 50,
        "Battery Capacity": "4614mAh"
      },
      "Month of Sale": "February",
      "Seasonal Effect": 0.8,
      "Competitor Price": 650,
      "Demand Level": 0.7,
      year_of_sale: 2023
    },
    {
      Brand: "Samsung",
      Model: "Galaxy S21",
      Price: 799,
      "Original Price": 999,
      Stock: 150,
      Category: "Smartphones",
      Specifications: {
        Storage: "128GB",
        RAM: "8GB",
        "Processor Type": "Snapdragon 888",
        "Display Hz": 120,
        "Camera MP": 12,
        "Battery Capacity": "4000mAh"
      },
      "Month of Sale": "March",
      "Seasonal Effect": 1.2,
      "Competitor Price": 750,
      "Demand Level": 0.8,
      year_of_sale: 2023
    },
    {
      Brand: "Apple",
      Model: "iPhone 13",
      Price: 899,
      "Original Price": 999,
      Stock: 100,
      Category: "Smartphones",
      Specifications: {
        Storage: "256GB",
        RAM: "6GB",
        "Processor Type": "A15 Bionic",
        "Display Hz": 60,
        "Camera MP": 12,
        "Battery Capacity": "3240mAh"
      },
      "Month of Sale": "March",
      "Seasonal Effect": 1.3,
      "Competitor Price": 850,
      "Demand Level": 0.9,
      year_of_sale: 2023
    },
    {
      Brand: "Google",
      Model: "Pixel 6",
      Price: 699,
      "Original Price": 799,
      Stock: 120,
      Category: "Smartphones",
      Specifications: {
        Storage: "128GB",
        RAM: "8GB",
        "Processor Type": "Tensor",
        "Display Hz": 90,
        "Camera MP": 50,
        "Battery Capacity": "4614mAh"
      },
      "Month of Sale": "March",
      "Seasonal Effect": 1.1,
      "Competitor Price": 650,
      "Demand Level": 0.7,
      year_of_sale: 2023
    },
    {
      Brand: "Samsung",
      Model: "Galaxy S22",
      Price: 899,
      "Original Price": 1099,
      Stock: 140,
      Category: "Smartphones",
      Specifications: {
        Storage: "256GB",
        RAM: "8GB",
        "Processor Type": "Snapdragon 8 Gen 1",
        "Display Hz": 120,
        "Camera MP": 50,
        "Battery Capacity": "4500mAh"
      },
      "Month of Sale": "April",
      "Seasonal Effect": 1.0,
      "Competitor Price": 850,
      "Demand Level": 0.85,
      year_of_sale: 2023
    },
    {
      Brand: "Apple",
      Model: "iPhone 13",
      Price: 899,
      "Original Price": 999,
      Stock: 90,
      Category: "Smartphones",
      Specifications: {
        Storage: "256GB",
        RAM: "6GB",
        "Processor Type": "A15 Bionic",
        "Display Hz": 60,
        "Camera MP": 12,
        "Battery Capacity": "3240mAh"
      },
      "Month of Sale": "April",
      "Seasonal Effect": 1.2,
      "Competitor Price": 850,
      "Demand Level": 0.9,
      year_of_sale: 2023
    },
    {
      Brand: "Google",
      Model: "Pixel 6 Pro",
      Price: 799,
      "Original Price": 899,
      Stock: 110,
      Category: "Smartphones",
      Specifications: {
        Storage: "128GB",
        RAM: "12GB",
        "Processor Type": "Tensor",
        "Display Hz": 120,
        "Camera MP": 50,
        "Battery Capacity": "5003mAh"
      },
      "Month of Sale": "April",
      "Seasonal Effect": 1.1,
      "Competitor Price": 750,
      "Demand Level": 0.8,
      year_of_sale: 2023
    },
    {
      Brand: "Samsung",
      Model: "Galaxy S22",
      Price: 899,
      "Original Price": 1099,
      Stock: 130,
      Category: "Smartphones",
      Specifications: {
        Storage: "256GB",
        RAM: "8GB",
        "Processor Type": "Snapdragon 8 Gen 1",
        "Display Hz": 120,
        "Camera MP": 50,
        "Battery Capacity": "4500mAh"
      },
      "Month of Sale": "May",
      "Seasonal Effect": 0.9,
      "Competitor Price": 850,
      "Demand Level": 0.85,
      year_of_sale: 2023
    },
    {
      Brand: "Apple",
      Model: "iPhone 13 Pro",
      Price: 1099,
      "Original Price": 1199,
      Stock: 80,
      Category: "Smartphones",
      Specifications: {
        Storage: "256GB",
        RAM: "6GB",
        "Processor Type": "A15 Bionic",
        "Display Hz": 120,
        "Camera MP": 12,
        "Battery Capacity": "3095mAh"
      },
      "Month of Sale": "May",
      "Seasonal Effect": 1.3,
      "Competitor Price": 1050,
      "Demand Level": 0.95,
      year_of_sale: 2023
    },
    {
      Brand: "Google",
      Model: "Pixel 6 Pro",
      Price: 799,
      "Original Price": 899,
      Stock: 100,
      Category: "Smartphones",
      Specifications: {
        Storage: "128GB",
        RAM: "12GB",
        "Processor Type": "Tensor",
        "Display Hz": 120,
        "Camera MP": 50,
        "Battery Capacity": "5003mAh"
      },
      "Month of Sale": "May",
      "Seasonal Effect": 1.2,
      "Competitor Price": 750,
      "Demand Level": 0.8,
      year_of_sale: 2023
    },
    {
      Brand: "Samsung",
      Model: "Galaxy S22",
      Price: 899,
      "Original Price": 1099,
      Stock: 120,
      Category: "Smartphones",
      Specifications: {
        Storage: "256GB",
        RAM: "8GB",
        "Processor Type": "Snapdragon 8 Gen 1",
        "Display Hz": 120,
        "Camera MP": 50,
        "Battery Capacity": "4500mAh"
      },
      "Month of Sale": "June",
      "Seasonal Effect": 1.1,
      "Competitor Price": 850,
      "Demand Level": 0.85,
      year_of_sale: 2023
    },
    {
      Brand: "Apple",
      Model: "iPhone 13 Pro",
      Price: 1099,
      "Original Price": 1199,
      Stock: 70,
      Category: "Smartphones",
      Specifications: {
        Storage: "256GB",
        RAM: "6GB",
        "Processor Type": "A15 Bionic",
        "Display Hz": 120,
        "Camera MP": 12,
        "Battery Capacity": "3095mAh"
      },
      "Month of Sale": "June",
      "Seasonal Effect": 1.4,
      "Competitor Price": 1050,
      "Demand Level": 0.95,
      year_of_sale: 2023
    },
    {
      Brand: "Google",
      Model: "Pixel 6 Pro",
      Price: 799,
      "Original Price": 899,
      Stock: 90,
      Category: "Smartphones",
      Specifications: {
        Storage: "128GB",
        RAM: "12GB",
        "Processor Type": "Tensor",
        "Display Hz": 120,
        "Camera MP": 50,
        "Battery Capacity": "5003mAh"
      },
      "Month of Sale": "June",
      "Seasonal Effect": 1.3,
      "Competitor Price": 750,
      "Demand Level": 0.8,
      year_of_sale: 2023
    }
  ];

  public getAllProducts(): Product[] {
    return this.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  public getProductSales(productId: string): ProductSale[] {
    return this.productSales.filter(sale => sale.productId === productId);
  }

  public getCompetitorPrices(productId: string): CompetitorPrice[] {
    return this.competitorPrices.filter(price => price.productId === productId);
  }

  public getSalesTrend(productId: string): { date: string; sales: number; revenue: number; }[] {
    const sales = this.getProductSales(productId);
    return sales.map(sale => ({
      date: sale.date,
      sales: sale.quantity,
      revenue: sale.quantity * sale.price
    }));
  }

  public predictOptimalPrice(productId: string): PricePrediction | null {
    const product = this.getProductById(productId);
    if (!product) return null;

    // Mock prediction logic
    const demandCoefficient = 0.8;
    const competitorInfluence = 0.1;
    const seasonalityFactor = product.seasonality;
    const marginOptimization = 0.15;

    const optimalPrice = product.basePrice * (1 + marginOptimization) * (1 + seasonalityFactor) - (competitorInfluence * 5);
    const confidence = 75 + (product.seasonality * 10);

    return {
      productId: product.id,
      basePrice: product.basePrice,
      optimalPrice: Math.max(optimalPrice, product.cost * 1.2),
      confidence: Math.min(confidence, 95),
      factors: {
        demandCoefficient,
        competitorInfluence,
        seasonalityFactor,
        marginOptimization
      }
    };
  }

  // Add or modify this method to accept a custom original price parameter
  public simulateDiscount(params: SimulationParams, originalPrice?: number): SimulationResult {
    // Get product by ID
    const product = this.getProductById(params.productId);
    
    // Use provided originalPrice if available, otherwise use product's basePrice
    const productPrice = originalPrice || (product?.basePrice || 0);
    
    // Calculate discounted price
    const discountedPrice = productPrice * (1 - params.discountRate);
    
    // Calculate profit based on price elasticity model
    const elasticity = -1.5; // Price elasticity of demand (-1.5 means 1% price decrease -> 1.5% demand increase)
    const priceChangePercent = -params.discountRate;
    const quantityChangePercent = -priceChangePercent * elasticity * params.expectedDemandIncrease;
    
    // Assume baseline quantity of 100 units per month
    const baselineQuantity = 100;
    const expectedQuantity = baselineQuantity * (1 + quantityChangePercent);
    
    // Calculate revenue and profit
    const expectedRevenue = expectedQuantity * discountedPrice;
    const expectedProfit = expectedQuantity * (discountedPrice - (product?.cost || 0));
    
    return {
      productId: params.productId,
      originalPrice: productPrice,
      discountedPrice,
      expectedSales: expectedQuantity,
      expectedRevenue,
      expectedProfit
    };
  }

  getDataset(): SmartphoneInputData[] {
    return this.dataset;
  }

  predictPrice(modelName: string, basePrice: number, profitMargin: number): number {
    // Find the closest neighbors based on specifications
    const modelData = this.dataset.filter(item => item.Model === modelName);
    if (modelData.length === 0) {
      throw new Error(`No data found for model ${modelName}`);
    }

    // Calculate the predicted price based on the average price of the neighbors
    const predictedPrice = basePrice * (1 + profitMargin / 100);
    return predictedPrice;
  }
}

export const dataService = new DataService();
