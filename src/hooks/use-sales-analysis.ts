
import { useState, useEffect, useCallback } from 'react';
import { dataService } from '@/services/dataService';
import { SalesTrend } from '@/types';

export function useSalesAnalysis() {
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [salesTrends, setSalesTrends] = useState<SalesTrend[]>([]);
  const [timeframe, setTimeframe] = useState<'all' | '30d' | '90d' | '180d'>('30d');
  const [salesByCategory, setSalesByCategory] = useState<Array<{
    name: string;
    value: number;
    units: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  
  // Hardcoded product options as specified
  const productMap = {
    'all': 'All Products',
    'iphone15promax': 'Apple iPhone 15 Pro Max',
    'iphone15pro': 'Apple iPhone 15 Pro',
    'iphone14promax': 'Apple iPhone 14 Pro Max',
    'iphone14pro': 'Apple iPhone 14 Pro',
    'iphone11': 'Apple iPhone 11'
  };
  
  const updateSalesTrends = useCallback((productId: string, selectedTimeframe: string) => {
    setLoading(true);
    
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
    
    // Generate sales trends for the selected product and timeframe
    const trends = dataService.getSalesTrends(
      productId === 'all' ? undefined : productId,
      startDate
    );
    
    // Sort trends by date ascending
    trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate totals
    const totalRev = trends.reduce((sum, day) => sum + day.revenue, 0);
    const totalUnit = trends.reduce((sum, day) => sum + day.sales, 0);
    
    setSalesTrends(trends);
    setTotalRevenue(totalRev);
    setTotalUnits(totalUnit);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    // Initial data load
    setLoading(true);
    
    // Update sales by category with more meaningful categories
    const categoryData = [
      { name: 'Premium', value: 150000, units: 120 },
      { name: 'Mid Range', value: 95000, units: 200 },
      { name: 'Budget', value: 75000, units: 350 }
    ];
    
    setSalesByCategory(categoryData);
    
    // Load initial trends data
    updateSalesTrends(selectedProductId, timeframe);
  }, []);
  
  useEffect(() => {
    updateSalesTrends(selectedProductId, timeframe);
  }, [selectedProductId, timeframe, updateSalesTrends]);
  
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
  };
  
  // Get the selected product name
  const getSelectedProductName = () => {
    return productMap[selectedProductId as keyof typeof productMap] || 'Unknown Product';
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
