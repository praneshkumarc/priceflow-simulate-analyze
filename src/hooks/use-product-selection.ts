
import { useState, useEffect } from 'react';
import { dataService } from '@/services/dataService';
import { predictionService } from '@/services/predictionService';
import { Product } from '@/types';

export function useProductSelection() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [userAddedProducts, setUserAddedProducts] = useState<Product[]>([]);
  const [productsWithPredictions, setProductsWithPredictions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictedPrices, setPredictedPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load all products
    const products = dataService.getAllProducts();
    setAllProducts(products);
    
    // Filter to user added products only
    setUserAddedProducts(products);
    
    // Get products with predictions
    const withPredictions = predictionService.getProductsWithPredictions(products);
    setProductsWithPredictions(withPredictions);
    
    // Get all predicted prices
    setPredictedPrices(predictionService.getAllPredictedPrices());
    
    setLoading(false);
  }, []);

  const refreshProducts = () => {
    const products = dataService.getAllProducts();
    setAllProducts(products);
    setUserAddedProducts(products);
    
    const withPredictions = predictionService.getProductsWithPredictions(products);
    setProductsWithPredictions(withPredictions);
    setPredictedPrices(predictionService.getAllPredictedPrices());
  };

  return {
    allProducts,
    userAddedProducts,
    productsWithPredictions,
    predictedPrices,
    loading,
    refreshProducts
  };
}
