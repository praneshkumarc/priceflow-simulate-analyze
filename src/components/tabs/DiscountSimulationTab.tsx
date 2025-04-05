
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
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';
import { dataService } from '@/services/dataService';
import { predictionService } from '@/services/predictionService';
import { Product, SimulationParams, SimulationResult } from '@/types';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters';
import ProductSelect from '../ProductSelect';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart as BarChartIcon, LineChart as LineChartIcon, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductSelection } from '@/hooks/use-product-selection';
import { useAuth } from '@/contexts/AuthContext';

const DiscountSimulationTab: React.FC = () => {
  const { productsWithPredictions, predictedPrices, refreshProducts } = useProductSelection();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  
  // Simulation params
  const [discountRate, setDiscountRate] = useState<number>(0.1); // 10% default
  const [expectedDemandIncrease, setExpectedDemandIncrease] = useState<number>(1.2); // 20% default
  
  // For comparison
  const [compareMode, setCompareMode] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    // Make sure we have the latest predictions
    if (user) {
      refreshProducts();
    }
    
    // Extract unique models from the dataset
    const dataset = dataService.getDataset();
    if (dataset && dataset.length > 0) {
      const uniqueModels = [...new Set(dataset.map(item => item.Model))];
      setModels(uniqueModels);
    }
    
    setLoading(false);
  }, [user]);
  
  // When productsWithPredictions changes, update the selected product
  useEffect(() => {
    console.log('Products with predictions updated:', productsWithPredictions);
    console.log('Predicted prices:', predictedPrices);
    
    // If there are products with predictions, select the first one by default
    if (productsWithPredictions.length > 0 && !selectedProductId) {
      setSelectedProductId(productsWithPredictions[0].id);
    }
  }, [productsWithPredictions, predictedPrices]);
  
  useEffect(() => {
    if (!selectedProductId) return;
    
    // Get the selected product from products with predictions
    const product = productsWithPredictions.find(p => p.id === selectedProductId);
    setSelectedProduct(product || null);
    
    // Clear simulations when product changes
    setSimulations([]);
  }, [selectedProductId, productsWithPredictions]);
  
  // When selected model changes, find a matching product with prediction
  useEffect(() => {
    if (selectedModel && productsWithPredictions.length > 0) {
      const matchingProduct = productsWithPredictions.find(p => 
        p.specifications?.model === selectedModel
      );
      
      if (matchingProduct) {
        setSelectedProductId(matchingProduct.id);
      }
    }
  }, [selectedModel, productsWithPredictions]);
  
  const runSimulation = () => {
    if (!selectedProductId || !selectedProduct) return;
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30); // 30 days simulation
    
    // Use predictedPrice if available, otherwise use basePrice
    const originalPrice = predictedPrices[selectedProductId] || selectedProduct.basePrice;
    
    const params: SimulationParams = {
      productId: selectedProductId,
      discountRate,
      startDate: today.toISOString().split('T')[0],
      endDate: futureDate.toISOString().split('T')[0],
      expectedDemandIncrease
    };
    
    try {
      const result = dataService.simulateDiscount(params, originalPrice);
      setSimulations(prev => [...prev, result]);
    } catch (error) {
      console.error("Simulation error:", error);
    }
  };
  
  const resetSimulations = () => {
    setSimulations([]);
  };
  
  // Generate data for comparison chart
  const generateComparisonData = () => {
    if (!selectedProduct || simulations.length === 0) return [];
    
    // Use predictedPrice if available, otherwise use basePrice
    const originalPrice = predictedPrices[selectedProductId] || selectedProduct.basePrice;
    const originalProfit = (originalPrice - selectedProduct.cost) * 100; // Assume 100 units
    
    const comparisonData = simulations.map((sim, index) => {
      return {
        name: `Scenario ${index + 1}`,
        discount: formatPercentage(1 - (sim.discountedPrice / sim.originalPrice)),
        revenue: sim.expectedRevenue,
        profit: sim.expectedProfit,
        price: sim.discountedPrice
      };
    });
    
    // Add the baseline scenario (no discount)
    comparisonData.unshift({
      name: 'No Discount',
      discount: '0%',
      revenue: originalPrice * 100, // Assume 100 units as baseline
      profit: originalProfit,
      price: originalPrice
    });
    
    return comparisonData;
  };
  
  const comparisonData = generateComparisonData();
  
  // Generate data for effect curve
  const generateEffectCurve = () => {
    if (!selectedProduct) return [];
    
    // Use predictedPrice if available, otherwise use basePrice
    const basePrice = predictedPrices[selectedProductId] || selectedProduct.basePrice;
    
    const discounts = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4];
    const data = [];
    
    for (const disc of discounts) {
      const discountedPrice = basePrice * (1 - disc);
      const priceChangePercent = disc;
      const elasticity = -1.5;
      const quantityChangePercent = priceChangePercent * elasticity;
      
      // Start with 100 units as baseline
      const baselineQuantity = 100;
      const expectedQuantity = baselineQuantity * (1 + quantityChangePercent);
      const expectedRevenue = expectedQuantity * discountedPrice;
      const expectedProfit = expectedQuantity * (discountedPrice - selectedProduct.cost);
      
      data.push({
        discount: disc,
        price: discountedPrice,
        quantity: expectedQuantity,
        revenue: expectedRevenue,
        profit: expectedProfit
      });
    }
    
    return data;
  };
  
  const effectCurveData = generateEffectCurve();
  
  const latestSimulation = simulations.length > 0 ? simulations[simulations.length - 1] : null;
  
  // Get product options with predicted prices
  const getProductOptionsWithPredictions = () => {
    return productsWithPredictions.map(product => {
      const predictedPrice = predictedPrices[product.id] || product.basePrice;
      
      return {
        id: product.id,
        name: product.name,
        basePrice: product.basePrice,
        predictedPrice: predictedPrice,
        model: product.specifications?.model || ''
      };
    });
  };
  
  const productOptions = getProductOptionsWithPredictions();
  
  return (
    <div className="space-y-6">
      {!user && (
        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                You need to be logged in to simulate discounts for your products.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Discount Simulation</CardTitle>
            <CardDescription>Set parameters and run discount simulations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productsWithPredictions.length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    {user ? "No products with predictions found. Generate price predictions in the Price Prediction tab first." 
                          : "Login to manage your products and run discount simulations."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Select Model</Label>
                      <Select
                        value={selectedModel}
                        onValueChange={setSelectedModel}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Model" />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Select Product</Label>
                      <ProductSelect
                        products={productsWithPredictions}
                        onProductSelect={setSelectedProductId}
                        selectedProductId={selectedProductId}
                        placeholder="Select a product with prediction"
                        showPrices={false}
                        predictedPrices={predictedPrices}
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Discount Rate: {formatPercentage(discountRate)}</Label>
                      <Slider
                        value={[discountRate]}
                        min={0}
                        max={0.5}
                        step={0.01}
                        onValueChange={(value) => setDiscountRate(value[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Expected Demand Multiplier</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="number" 
                          min={0.5} 
                          max={3} 
                          step={0.1}
                          value={expectedDemandIncrease}
                          onChange={(e) => setExpectedDemandIncrease(Number(e.target.value))}
                        />
                        <span className="text-sm text-muted-foreground">
                          ({formatPercentage(expectedDemandIncrease - 1)} increase)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={resetSimulations}
                      disabled={simulations.length === 0}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                    
                    <Button
                      onClick={runSimulation}
                      disabled={!selectedProductId}
                    >
                      Run Simulation <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {latestSimulation && (
          <Card>
            <CardHeader>
              <CardTitle>Latest Simulation</CardTitle>
              <CardDescription>
                {selectedProduct?.name || 'Product'} with {formatPercentage(discountRate)} discount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">Original Price</div>
                    <div className="text-lg font-bold">{formatCurrency(latestSimulation.originalPrice)}</div>
                  </div>
                  <div className="border p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">Discounted Price</div>
                    <div className="text-lg font-bold text-app-blue-500">{formatCurrency(latestSimulation.discountedPrice)}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Expected Sales</div>
                  <div className="text-xl font-bold">{formatNumber(latestSimulation.expectedSales)} units</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">Expected Revenue</div>
                    <div className="text-lg font-bold">{formatCurrency(latestSimulation.expectedRevenue)}</div>
                  </div>
                  <div className="border p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">Expected Profit</div>
                    <div className="text-lg font-bold">{formatCurrency(latestSimulation.expectedProfit)}</div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" onClick={() => setCompareMode(!compareMode)}>
                  {compareMode ? 'Hide Comparison' : 'Compare Scenarios'} <BarChartIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {simulations.length > 0 && compareMode && (
        <Card>
          <CardHeader>
            <CardTitle>Scenario Comparison</CardTitle>
            <CardDescription>Compare different discount scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(Number(value)), name]}
                    labelFormatter={(value) => `${value}`}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#3aa4ff" />
                  <Bar dataKey="profit" name="Profit" fill="#4ac0c0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium mb-2">Scenario Details</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2">Scenario</th>
                      <th className="text-left pb-2">Discount</th>
                      <th className="text-left pb-2">Price</th>
                      <th className="text-left pb-2">Revenue</th>
                      <th className="text-left pb-2">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((scenario, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-2">{scenario.name}</td>
                        <td className="py-2">{scenario.discount}</td>
                        <td className="py-2">{formatCurrency(scenario.price)}</td>
                        <td className="py-2">{formatCurrency(scenario.revenue)}</td>
                        <td className="py-2">{formatCurrency(scenario.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Price Elasticity Effect</CardTitle>
          <CardDescription>How discounts affect revenue and profit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={effectCurveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="discount" 
                  tickFormatter={(value) => formatPercentage(value)}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(Number(value)), name]}
                  labelFormatter={(value) => `Discount: ${formatPercentage(Number(value))}`}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3aa4ff" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#4ac0c0" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>This chart shows how different discount rates affect projected revenue and profit based on price elasticity modeling. 
            The optimal discount rate typically balances increased sales volume with decreased unit margins.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountSimulationTab;
