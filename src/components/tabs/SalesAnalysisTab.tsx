
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dataService } from '@/services/dataService';
import { Product, SalesTrend } from '@/types';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductSelect from '@/components/ProductSelect';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Skeleton } from '@/components/ui/skeleton';

const SalesAnalysisTab: React.FC = () => {
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
  const isMobile = useMediaQuery("(max-width: 768px)");
  
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
  
  // COLORS for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const getTimeframeLabel = () => {
    switch (timeframe) {
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case '180d': return 'Last 180 Days';
      default: return 'All Time';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="w-full md:w-1/3">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <ProductSelect
              products={products}
              onProductSelect={handleProductChange}
              selectedProductId={selectedProductId}
              placeholder="Select a product to analyze"
              showPrices={false}
            />
          )}
        </div>
        
        <div>
          <Tabs
            defaultValue={timeframe}
            value={timeframe}
            onValueChange={(value) => setTimeframe(value as 'all' | '30d' | '90d' | '180d')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="all" className="text-xs md:text-sm">
                All Time
              </TabsTrigger>
              <TabsTrigger value="180d" className="text-xs md:text-sm">
                180 Days
              </TabsTrigger>
              <TabsTrigger value="90d" className="text-xs md:text-sm">
                90 Days
              </TabsTrigger>
              <TabsTrigger value="30d" className="text-xs md:text-sm">
                30 Days
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trends</CardTitle>
            <CardDescription>
              {getSelectedProductName()} - {getTimeframeLabel()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px]">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    revenue: { color: "#3aa4ff" },
                    sales: { color: "#4ac0c0" }
                  }}
                >
                  <LineChart data={salesTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => isMobile ? `${value / 1000}k` : formatNumber(value)}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-lg">
                              <p className="font-medium">{formatDate(label as string)}</p>
                              <p className="text-[#3aa4ff]">
                                Revenue: {formatCurrency(payload[0].value as number)}
                              </p>
                              <p className="text-[#4ac0c0]">
                                Units Sold: {formatNumber(payload[1].value as number)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3aa4ff" 
                      name="Revenue" 
                      dot={false}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#4ac0c0" 
                      name="Units Sold" 
                      dot={false}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground">Total Units</div>
                <div className="text-2xl font-bold">{formatNumber(totalUnits)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Revenue distribution across product categories</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px]">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={isMobile ? 70 : 80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => 
                        isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      animationDuration={500}
                    >
                      {salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-lg">
                              <p className="font-medium">{payload[0].name}</p>
                              <p>Revenue: {formatCurrency(payload[0].value as number)}</p>
                              <p>Units: {formatNumber(payload[0].payload.units)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Category Distribution</div>
              <div className="space-y-1">
                {salesByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 mr-2 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(category.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesAnalysisTab;
