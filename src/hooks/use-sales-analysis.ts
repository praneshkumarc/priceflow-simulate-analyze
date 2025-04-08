
import { useState, useEffect } from 'react';
import { dataService } from '@/services/dataService';
import { Product, SalesTrend } from '@/types';

export function useSalesAnalysis() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [salesTrends, setSalesTrends] = useState<SalesTrend[]>([]);
  const [timeframe, setTimeframe] = useState<'all' | '30d' | '90d' | '180d'>('30d');
  const [salesByCategory, setSalesByCategory] = useState<Array<{
    name: string;
    value: number;
    units: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load products
    const loadData = async () => {
      setLoading(true);
      const allProducts = dataService.getAllProducts();
      setProducts(allProducts);
      
      // Calculate sales by category
      const allSales = dataService.getAllSales();
      const productMap = new Map(allProducts.map(p => [p.id, p]));
      
      const categorySales = allSales.reduce((acc, sale) => {
        const product = productMap.get(sale.productId);
        if (product) {
          const category = product.category;
          if (!acc[category]) {
            acc[category] = { revenue: 0, units: 0 };
          }
          acc[category].revenue += sale.price * sale.quantity;
          acc[category].units += sale.quantity;
        }
        return acc;
      }, {} as Record<string, { revenue: number; units: number }>);
      
      const categoryData = Object.entries(categorySales).map(([category, data]) => ({
        name: category,
        value: data.revenue,
        units: data.units
      }));
      
      setSalesByCategory(categoryData);
      
      // Load initial trends data
      updateSalesTrends(selectedProductId, timeframe);
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  const updateSalesTrends = (productId: string, selectedTimeframe: string) => {
    let startDate: string | undefined;
    const now = new Date();
    
    if (selectedTimeframe === '30d') {
      const date = new Date();
      date.setDate(now.getDate() - 30);
      startDate = date.toISOString().split('T')[0];
    } else if (selectedTimeframe === '90d') {
      const date = new Date();
      date.setDate(now.getDate() - 90);
      startDate = date.toISOString().split('T')[0];
    } else if (selectedTimeframe === '180d') {
      const date = new Date();
      date.setDate(now.getDate() - 180);
      startDate = date.toISOString().split('T')[0];
    }
    
    // Get sales trends for the selected product and timeframe
    const trends = dataService.getSalesTrends(
      productId === 'all' ? undefined : productId,
      startDate
    );
    
    setSalesTrends(trends);
  };
  
  useEffect(() => {
    updateSalesTrends(selectedProductId, timeframe);
  }, [selectedProductId, timeframe]);
  
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
  };
  
  // Calculate total revenue and units from trends
  const totalRevenue = salesTrends.reduce((sum, day) => sum + day.revenue, 0);
  const totalUnits = salesTrends.reduce((sum, day) => sum + day.sales, 0);
  
  // Get the selected product name
  const getSelectedProductName = () => {
    if (selectedProductId === 'all') return 'All Products';
    const product = products.find(p => p.id === selectedProductId);
    return product ? product.name : 'Selected Product';
  };
  
  const getTimeframeLabel = () => {
    switch (timeframe) {
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case '180d': return 'Last 180 Days';
      default: return 'All Time';
    }
  };

  return {
    products,
    selectedProductId,
    salesTrends,
    timeframe,
    salesByCategory,
    loading,
    totalRevenue,
    totalUnits,
    handleProductChange,
    setTimeframe,
    getSelectedProductName,
    getTimeframeLabel
  };
}
