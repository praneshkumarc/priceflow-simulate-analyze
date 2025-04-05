
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/dataService';
import { predictionService } from '@/services/predictionService';
import { Product, PricePrediction } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define interfaces for Supabase table rows
interface UserProduct {
  id: string;
  user_id: string;
  name: string;
  base_price: number;
  category: string;
  inventory: number | null;
  cost: number;
  seasonality: number | null;
  specifications: any | null;
  model: string;
  created_at: string | null;
  updated_at: string | null;
}

interface UserPricePrediction {
  id: string;
  user_id: string;
  product_id: string;
  base_price: number;
  optimal_price: number;
  confidence: number | null;
  factors: any | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useProductSelection() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [userAddedProducts, setUserAddedProducts] = useState<Product[]>([]);
  const [productsWithPredictions, setProductsWithPredictions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictedPrices, setPredictedPrices] = useState<Record<string, number>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Load sample products for new users to explore
    const sampleProducts = dataService.getAllProducts();
    setAllProducts(sampleProducts);
    
    // Only fetch user products if user is logged in
    if (user) {
      fetchUserProducts();
      fetchUserPredictions();
    } else {
      // If not logged in, set user products to empty
      setUserAddedProducts([]);
      setProductsWithPredictions([]);
      setPredictedPrices({});
      setLoading(false);
    }
  }, [user]);

  const fetchUserProducts = async () => {
    try {
      setLoading(true);
      const { data: userProducts, error } = await supabase
        .from('user_products')
        .select('*') as { data: UserProduct[] | null, error: any };

      if (error) {
        console.error('Error fetching user products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your products',
          variant: 'destructive',
        });
        setUserAddedProducts([]);
      } else if (userProducts) {
        // Transform to match Product interface
        const transformedProducts: Product[] = userProducts.map(item => ({
          id: item.id,
          name: item.name,
          basePrice: Number(item.base_price),
          category: item.category,
          inventory: item.inventory || 0,
          cost: Number(item.cost),
          seasonality: item.seasonality || 0,
          specifications: item.specifications,
        }));
        
        setUserAddedProducts(transformedProducts);
      } else {
        setUserAddedProducts([]);
      }
    } catch (error) {
      console.error('Exception fetching user products:', error);
      setUserAddedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPredictions = async () => {
    try {
      // Fetch predictions for the user's products
      const { data: predictions, error } = await supabase
        .from('user_price_predictions')
        .select('*') as { data: UserPricePrediction[] | null, error: any };

      if (error) {
        console.error('Error fetching predictions:', error);
        setProductsWithPredictions([]);
        setPredictedPrices({});
        return;
      }

      if (predictions) {
        // Create a map of predicted prices
        const priceMap: Record<string, number> = {};
        predictions.forEach(pred => {
          priceMap[pred.product_id] = Number(pred.optimal_price);
        });
        setPredictedPrices(priceMap);

        // Filter products that have predictions
        if (userAddedProducts.length > 0) {
          const withPredictions = userAddedProducts.filter(p => 
            priceMap[p.id] !== undefined && priceMap[p.id] > 0
          );
          setProductsWithPredictions(withPredictions);
        }
      } else {
        setProductsWithPredictions([]);
        setPredictedPrices({});
      }
    } catch (error) {
      console.error('Exception fetching predictions:', error);
      setProductsWithPredictions([]);
      setPredictedPrices({});
    }
  };

  const refreshProducts = async () => {
    if (user) {
      await fetchUserProducts();
      await fetchUserPredictions();
    }
  };

  const addUserProduct = async (product: Omit<Product, 'id'>) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to add products',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase.from('user_products').insert({
        user_id: user.id,
        name: product.name,
        model: product.specifications?.model || '',
        base_price: product.basePrice,
        category: product.category,
        inventory: product.inventory,
        cost: product.cost,
        seasonality: product.seasonality,
        specifications: product.specifications,
      }).select().single() as { data: UserProduct | null, error: any };

      if (error) {
        console.error('Error adding product:', error);
        toast({
          title: 'Error',
          description: 'Failed to add product',
          variant: 'destructive',
        });
        return null;
      }

      if (data) {
        // Transform the returned product to match Product interface
        const newProduct: Product = {
          id: data.id,
          name: data.name,
          basePrice: Number(data.base_price),
          category: data.category,
          inventory: data.inventory || 0,
          cost: Number(data.cost),
          seasonality: data.seasonality || 0,
          specifications: data.specifications,
        };

        // Update local state
        setUserAddedProducts(prev => [...prev, newProduct]);
        
        toast({
          title: 'Success',
          description: 'Product added successfully',
        });
        
        return newProduct;
      }
      
      return null;
    } catch (error) {
      console.error('Exception adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive',
      });
      return null;
    }
  };

  const savePrediction = async (productId: string, prediction: PricePrediction) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to save predictions',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Check if prediction already exists
      const { data: existing } = await supabase
        .from('user_price_predictions')
        .select('*')
        .eq('product_id', productId)
        .maybeSingle() as { data: UserPricePrediction | null, error: any };

      let result;
      
      if (existing) {
        // Update existing prediction
        result = await supabase
          .from('user_price_predictions')
          .update({
            base_price: prediction.basePrice,
            optimal_price: prediction.optimalPrice,
            confidence: prediction.confidence,
            factors: prediction.factors,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Insert new prediction
        result = await supabase
          .from('user_price_predictions')
          .insert({
            user_id: user.id,
            product_id: productId,
            base_price: prediction.basePrice,
            optimal_price: prediction.optimalPrice,
            confidence: prediction.confidence,
            factors: prediction.factors,
          });
      }

      if (result.error) {
        console.error('Error saving prediction:', result.error);
        toast({
          title: 'Error',
          description: 'Failed to save prediction',
          variant: 'destructive',
        });
        return false;
      }

      // Update local state
      const updatedPrices = { ...predictedPrices, [productId]: prediction.optimalPrice };
      setPredictedPrices(updatedPrices);
      
      // Update products with predictions
      await fetchUserPredictions();
      
      toast({
        title: 'Success',
        description: 'Price prediction saved successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Exception saving prediction:', error);
      toast({
        title: 'Error',
        description: 'Failed to save prediction',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    allProducts,
    userAddedProducts,
    productsWithPredictions,
    predictedPrices,
    loading,
    refreshProducts,
    addUserProduct,
    savePrediction
  };
}
