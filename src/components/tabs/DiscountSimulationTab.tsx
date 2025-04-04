
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dataService } from '@/services/dataService';
import { Product, SimulationParams, SimulationResult, SupabaseProduct } from '@/types';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatCurrency, formatDate, formatPercentage } from '@/utils/formatters';
import { Calendar as CalendarIcon, Calculator, Cpu, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PredictedProduct {
  id: string;
  name: string;
  price: number;
}

const DiscountSimulationTab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [predictedProducts, setPredictedProducts] = useState<PredictedProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [discountRate, setDiscountRate] = useState<number>(10);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // +7 days
  const [expectedDemandIncrease, setExpectedDemandIncrease] = useState<number>(20);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchProducts = async () => {
      // Get products from user's Supabase account
      if (user) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          // Convert Supabase products to the application's Product type
          const supabaseProducts = data || [];
          const convertedProducts: Product[] = supabaseProducts.map((item: SupabaseProduct) => ({
            id: item.id,
            name: item.name,
            basePrice: item.price,
            category: item.category,
            inventory: 10, // Default value
            cost: item.price * 0.6, // Default value (60% of price)
            seasonality: parseFloat(item.seasonality || "0.5"),
            price: item.price // Keep the original price
          }));
          
          setProducts(convertedProducts);
        } catch (error) {
          console.error('Error fetching products:', error);
          setProducts([]);
        }
      } else {
        const allProducts = dataService.getAllProducts();
        setProducts(allProducts);
      }
      
      // Load predicted products from session storage
      const storedPredictions = sessionStorage.getItem('predictedProducts');
      if (storedPredictions) {
        try {
          const predictionsMap = new Map(JSON.parse(storedPredictions));
          const predList: PredictedProduct[] = [];
          
          // Combine with products to get IDs
          for (const [modelName, price] of predictionsMap.entries()) {
            const matchedProduct = products.find(p => p.name === modelName);
            if (matchedProduct) {
              predList.push({
                id: matchedProduct.id,
                name: modelName,
                price: price as number
              });
            }
          }
          
          setPredictedProducts(predList);
          
          // Select first product by default
          if (predList.length > 0 && !selectedProductId) {
            setSelectedProductId(predList[0].id);
          }
        } catch (e) {
          console.error('Failed to parse stored predictions', e);
        }
      }
    };
    
    fetchProducts();
  }, [user, selectedProductId, products]);
  
  const runSimulation = () => {
    if (!selectedProductId) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const params: SimulationParams = {
        productId: selectedProductId,
        discountRate: discountRate / 100,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        expectedDemandIncrease: expectedDemandIncrease / 100,
      };
      
      const result = dataService.simulateDiscount(params);
      setSimulationResult(result);
      
      // Generate chart data
      generateChartData(result);
      
      setIsLoading(false);
    }, 800);  // Simulated delay for processing
  };
  
  const generateChartData = (result: SimulationResult) => {
    if (!result) return;
    
    // Find the selected product to get its base price
    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (!selectedProduct) return;
    
    // Find the matching predicted product for the actual price
    const predPrice = predictedProducts.find(p => p.id === selectedProductId)?.price || 
                       (selectedProduct.basePrice || parseFloat(selectedProduct.price?.toString() || "0"));
    
    // Comparison of revenue at different discount levels
    const comparisonData = [];
    for (let discount = 0; discount <= 50; discount += 5) {
      // Discounted price
      const discountedPrice = predPrice * (1 - discount / 100);
      
      // Estimated sales increase based on discount percentage
      // Simple model: Higher discounts lead to higher sales increases
      const salesIncrease = 1 + (discount / 100) * 2;  // E.g., 10% discount -> 20% sales increase
      
      // Base sales (no discount)
      const baseSales = 100;  // Placeholder value
      
      // Estimated sales with this discount
      const estimatedSales = baseSales * salesIncrease;
      
      // Revenue at original price
      const originalRevenue = baseSales * predPrice;
      
      // Revenue with discount
      const discountedRevenue = estimatedSales * discountedPrice;
      
      // Profit calculation (assuming 60% cost of the price)
      const cost = predPrice * 0.6;
      const originalProfit = baseSales * (predPrice - cost);
      const discountedProfit = estimatedSales * (discountedPrice - cost);
      
      comparisonData.push({
        discount: `${discount}%`,
        discountValue: discount,
        originalRevenue,
        discountedRevenue,
        originalProfit,
        discountedProfit,
        revenue: discountedRevenue,
        profit: discountedProfit,
        sales: estimatedSales
      });
    }
    
    setChartData(comparisonData);
  };
  
  // Find the optimal discount rate based on profit
  const findOptimalDiscount = () => {
    if (!chartData.length) return null;
    
    const maxProfitEntry = chartData.reduce((max, entry) => 
      entry.discountedProfit > max.discountedProfit ? entry : max, chartData[0]);
      
    return maxProfitEntry;
  };
  
  const optimalDiscount = findOptimalDiscount();
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Discount Simulation</CardTitle>
            <CardDescription>
              Simulate the impact of discount on sales and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select 
                  value={selectedProductId} 
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {predictedProducts.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({formatCurrency(product.price)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {predictedProducts.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    No predicted products available. Please predict prices for products first in the Price Prediction tab.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Discount Rate: {discountRate}%</Label>
                <Slider
                  min={0}
                  max={50}
                  step={1}
                  value={[discountRate]}
                  onValueChange={(value) => setDiscountRate(value[0])}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                        disabled={(date) => date < startDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Expected Demand Increase: {expectedDemandIncrease}%</Label>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[expectedDemandIncrease]}
                  onValueChange={(value) => setExpectedDemandIncrease(value[0])}
                />
              </div>
              
              <Button 
                onClick={runSimulation} 
                disabled={!selectedProductId || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Run Simulation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {simulationResult && (
          <Card>
            <CardHeader>
              <CardTitle>Simulation Results</CardTitle>
              <CardDescription>
                Impact of {discountRate}% discount on sales and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-sm font-medium text-muted-foreground">Original Price</div>
                    <div className="text-2xl font-bold">{formatCurrency(simulationResult.originalPrice)}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-green-600">Discounted Price</div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(simulationResult.discountedPrice)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Expected Sales</div>
                    <div className="text-lg font-bold">{Math.round(simulationResult.expectedSales)} units</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Revenue</div>
                    <div className="text-lg font-bold">{formatCurrency(simulationResult.expectedRevenue)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Profit</div>
                    <div className="text-lg font-bold">{formatCurrency(simulationResult.expectedProfit)}</div>
                  </div>
                </div>
                
                {optimalDiscount && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mt-4">
                    <div className="font-medium text-blue-700 mb-1">Optimal Discount Recommendation</div>
                    <div className="text-sm text-blue-600">
                      Based on our simulation, the optimal discount would be 
                      <span className="font-bold"> {optimalDiscount.discountValue}%</span>, 
                      which would yield an estimated profit of 
                      <span className="font-bold"> {formatCurrency(optimalDiscount.discountedProfit)}</span>.
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {simulationResult && chartData.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Comparison</CardTitle>
              <CardDescription>
                Comparison of revenue at different discount levels
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="discount" />
                  <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#2563eb"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke="#16a34a"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sales at Different Discounts</CardTitle>
              <CardDescription>
                Estimated units sold at various discount levels
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="discount" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Math.round(Number(value))} units`} />
                  <Bar
                    dataKey="sales"
                    name="Estimated Sales"
                    fill="#3b82f6"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DiscountSimulationTab;
