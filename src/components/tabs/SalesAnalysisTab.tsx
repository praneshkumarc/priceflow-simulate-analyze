
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SalesAnalysisTab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [salesTrends, setSalesTrends] = useState<SalesTrend[]>([]);
  const [timeframe, setTimeframe] = useState<'all' | '30d' | '90d' | '180d' | '365d'>('all');
  const [salesByCategory, setSalesByCategory] = useState<Array<{
    name: string;
    value: number;
    units: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  
  // Hardcoded iPhone models
  const iPhoneModels = [
    { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max' },
    { id: 'iphone-15', name: 'iPhone 15' },
    { id: 'iphone-11', name: 'iPhone 11' },
    { id: 'iphone-se-3', name: 'iPhone SE (3rd Gen)' },
    { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max' },
    { id: 'all', name: 'All Products' },
  ];
  
  useEffect(() => {
    // Load products
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
    
    // Set default product and load initial data
    setLoading(false);
  }, []);
  
  useEffect(() => {
    let startDate: string | undefined;
    const now = new Date();
    
    if (timeframe === '30d') {
      const date = new Date();
      date.setDate(now.getDate() - 30);
      startDate = date.toISOString().split('T')[0];
    } else if (timeframe === '90d') {
      const date = new Date();
      date.setDate(now.getDate() - 90);
      startDate = date.toISOString().split('T')[0];
    } else if (timeframe === '180d') {
      const date = new Date();
      date.setDate(now.getDate() - 180);
      startDate = date.toISOString().split('T')[0];
    } else if (timeframe === '365d') {
      const date = new Date();
      date.setDate(now.getDate() - 365);
      startDate = date.toISOString().split('T')[0];
    }
    
    // Get sales trends for the selected product and timeframe
    const trends = dataService.getSalesTrends(
      selectedProductId === 'all' ? undefined : selectedProductId,
      startDate
    );
    
    setSalesTrends(trends);
  }, [selectedProductId, timeframe]);
  
  // Calculate total revenue and units from trends
  const totalRevenue = salesTrends.reduce((sum, day) => sum + day.revenue, 0);
  const totalUnits = salesTrends.reduce((sum, day) => sum + day.sales, 0);
  
  // COLORS for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="w-full md:w-1/3">
          <Select
            value={selectedProductId}
            onValueChange={setSelectedProductId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a product to analyze" />
            </SelectTrigger>
            <SelectContent>
              {iPhoneModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Tabs defaultValue="all" value={timeframe} onValueChange={(value) => setTimeframe(value as 'all' | '30d' | '90d' | '180d' | '365d')}>
            <TabsList>
              <TabsTrigger value="all">
                All Time
              </TabsTrigger>
              <TabsTrigger value="365d">
                Last 1 Year
              </TabsTrigger>
              <TabsTrigger value="180d">
                Last 6 Months
              </TabsTrigger>
              <TabsTrigger value="90d">
                Last 3 Months
              </TabsTrigger>
              <TabsTrigger value="30d">
                Last 30 Days
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
              {selectedProductId === 'all' ? 'All Products' : iPhoneModels.find(p => p.id === selectedProductId)?.name}
              {' - '}
              {timeframe === 'all' ? 'All Time' : 
               timeframe === '365d' ? 'Last 1 Year' :
               timeframe === '180d' ? 'Last 6 Months' :
               timeframe === '90d' ? 'Last 3 Months' : 
               'Last 30 Days'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'Revenue' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                      name
                    ]}
                    labelFormatter={(label) => formatDate(label as string)}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3aa4ff" 
                    name="Revenue" 
                    dot={false}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#4ac0c0" 
                    name="Units Sold" 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
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
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
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
