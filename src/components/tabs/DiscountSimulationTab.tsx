
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
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { dataService } from '@/services/dataService';
import { predictionService } from '@/services/predictionService';
import { Product, SimulationParams, SimulationResult } from '@/types';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart as BarChartIcon, LineChart as LineChartIcon, RefreshCw, Play } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductSelection } from '@/hooks/use-product-selection';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

const DiscountSimulationTab: React.FC = () => {
  const { productsWithPredictions, predictedPrices, refreshProducts } = useProductSelection();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const { toast } = useToast();
  
  const [discountRate, setDiscountRate] = useState<number>(0.1); // 10% default
  const [expectedDemandIncrease, setExpectedDemandIncrease] = useState<number>(1.2); // 20% default
  
  const [compareMode, setCompareMode] = useState(false);
  const [businessScenarios, setBusinessScenarios] = useState<any[]>([]);
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState(false);
  const [optimalScenario, setOptimalScenario] = useState<any | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      refreshProducts();
    }
    
    const dataset = dataService.getDataset();
    if (dataset && dataset.length > 0) {
      const uniqueModels = [...new Set(dataset.map(item => item.Model))];
      setModels(uniqueModels);
      
      if (uniqueModels.length > 0 && !selectedModel) {
        setSelectedModel(uniqueModels[0]);
        
        const modelId = `model-${uniqueModels[0]}`;
        if (predictionService.hasPrediction(modelId)) {
          setSelectedProductId(modelId);
        }
      }
    }
    
    setLoading(false);
  }, [user]);
  
  useEffect(() => {
    if (selectedModel) {
      const productId = `model-${selectedModel}`;
      if (predictionService.hasPrediction(productId)) {
        setSelectedProductId(productId);
        
        const modelProduct = {
          id: productId,
          name: selectedModel,
          basePrice: 0,
          category: 'Smartphone',
          inventory: 0,
          cost: 0,
          seasonality: 0,
          specifications: { model: selectedModel }
        };
        
        setSelectedProduct(modelProduct);
      }
    }
  }, [selectedModel]);
  
  useEffect(() => {
    if (selectedProductId) {
      if (selectedProductId.startsWith('model-')) {
        const modelName = selectedProductId.replace('model-', '');
        const modelProduct = {
          id: selectedProductId,
          name: modelName,
          basePrice: 0,
          category: 'Smartphone',
          inventory: 0,
          cost: 0,
          seasonality: 0,
          specifications: { model: modelName }
        };
        setSelectedProduct(modelProduct);
      } else {
        const product = productsWithPredictions.find(p => p.id === selectedProductId);
        if (product) {
          setSelectedProduct(product);
        }
      }
    }
  }, [selectedProductId, productsWithPredictions]);
  
  const runSimulation = () => {
    if (!selectedProductId || !selectedProduct) return;
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    
    const predictedPrice = predictionService.getPredictedPrice(selectedProductId);
    const originalPrice = predictedPrice || selectedProduct.basePrice;
    const originalCost = selectedProduct.cost || originalPrice * 0.5;
    
    const params: SimulationParams = {
      productId: selectedProductId,
      discountRate,
      startDate: today.toISOString().split('T')[0],
      endDate: futureDate.toISOString().split('T')[0],
      expectedDemandIncrease
    };
    
    try {
      const result = dataService.simulateDiscount(params, originalPrice);
      const simulationResultWithCost = {
        ...result,
        productCost: originalCost
      };
      setSimulations(prev => [...prev, simulationResultWithCost]);
      
      if (simulations.length === 0) {
        setCompareMode(true);
      }
      
      toast({
        title: "Simulation Complete",
        description: `Simulated a ${formatPercentage(discountRate)} discount on ${selectedProduct.name}`,
      });
    } catch (error) {
      console.error("Simulation error:", error);
      toast({
        title: "Simulation Error",
        description: error instanceof Error ? error.message : "Error running simulation",
        variant: "destructive",
      });
    }
  };
  
  const generateBusinessScenarios = () => {
    if (!selectedProductId || !selectedProduct) return;
    
    setIsGeneratingScenarios(true);
    
    const predictedPrice = predictionService.getPredictedPrice(selectedProductId);
    const originalPrice = predictedPrice || selectedProduct.basePrice;
    const originalCost = selectedProduct.cost || originalPrice * 0.5;
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    
    // Generate a range of discount rates from 5% to 30%
    const discountRates = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3];
    // Generate a range of demand multipliers from 1.0 to 2.0
    const demandMultipliers = [1.0, 1.2, 1.4, 1.6, 1.8, 2.0];
    
    const scenarios = [];
    
    // Generate all combinations of discount rates and demand multipliers
    for (const discount of discountRates) {
      for (const demand of demandMultipliers) {
        const params: SimulationParams = {
          productId: selectedProductId,
          discountRate: discount,
          startDate: today.toISOString().split('T')[0],
          endDate: futureDate.toISOString().split('T')[0],
          expectedDemandIncrease: demand
        };
        
        try {
          const result = dataService.simulateDiscount(params, originalPrice);
          const scenario = {
            id: `${discount}-${demand}`,
            discount: discount,
            demand: demand,
            discountPercentage: formatPercentage(discount),
            demandIncrease: formatPercentage(demand - 1),
            price: result.discountedPrice,
            units: result.expectedSales,
            revenue: result.expectedRevenue,
            profit: result.expectedProfit,
            roi: (result.expectedProfit / (originalPrice * 100)) * 100,
            profitMargin: (result.expectedProfit / result.expectedRevenue) * 100
          };
          
          scenarios.push(scenario);
        } catch (error) {
          console.error("Scenario generation error:", error);
        }
      }
    }
    
    // Find the optimal scenario based on profit
    const optimal = scenarios.reduce((prev, current) => 
      prev.profit > current.profit ? prev : current
    );
    
    setBusinessScenarios(scenarios);
    setOptimalScenario(optimal);
    setCompareMode(true);
    setIsGeneratingScenarios(false);
    
    toast({
      title: "Business Scenarios Generated",
      description: `Generated ${scenarios.length} discount-demand scenarios for ${selectedProduct.name}`,
    });
  };
  
  const resetSimulations = () => {
    setSimulations([]);
    setBusinessScenarios([]);
    setOptimalScenario(null);
    setCompareMode(false);
    toast({
      title: "Simulations Reset",
      description: "All simulation scenarios have been cleared",
    });
  };
  
  const generateComparisonData = () => {
    if (!selectedProduct || simulations.length === 0) return [];
    
    const originalPrice = predictedPrices[selectedProductId] || selectedProduct.basePrice;
    const originalCost = selectedProduct.cost || originalPrice * 0.5;
    
    const baselineUnits = 100;
    const baselineRevenue = originalPrice * baselineUnits;
    const baselineProfit = (originalPrice - originalCost) * baselineUnits;
    
    const comparisonData = simulations.map((sim, index) => {
      const simulationUnits = sim.expectedSales;
      const simulationRevenue = sim.discountedPrice * simulationUnits;
      const simulationCost = sim.productCost !== undefined ? sim.productCost : originalCost;
      const simulationProfit = (sim.discountedPrice - simulationCost) * simulationUnits;
      
      return {
        name: `Scenario ${index + 1}`,
        discount: formatPercentage(1 - (sim.discountedPrice / sim.originalPrice)),
        revenue: simulationRevenue,
        profit: simulationProfit,
        price: sim.discountedPrice,
        units: simulationUnits
      };
    });
    
    comparisonData.unshift({
      name: 'No Discount',
      discount: '0%',
      revenue: baselineRevenue,
      profit: baselineProfit,
      price: originalPrice,
      units: baselineUnits
    });
    
    return comparisonData;
  };
  
  const comparisonData = generateComparisonData();
  
  const latestSimulation = simulations.length > 0 ? simulations[simulations.length - 1] : null;
  
  const getProductOptionsWithPredictions = () => {
    const modelPredictions = Object.keys(predictionService.getAllPredictedPrices())
      .filter(id => id.startsWith('model-'))
      .map(id => ({
        id: id,
        name: id.replace('model-', ''),
        basePrice: 0,
        predictedPrice: predictionService.getPredictedPrice(id),
        model: id.replace('model-', '')
      }));
      
    const productPredictions = productsWithPredictions.map(product => {
      const predictedPrice = predictedPrices[product.id] || product.basePrice;
      
      return {
        id: product.id,
        name: product.name,
        basePrice: product.basePrice,
        predictedPrice: predictedPrice,
        model: product.specifications?.model || ''
      };
    });
    
    return [...modelPredictions, ...productPredictions];
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
              {predictionService.getPredictedProductIds().length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    {user ? "No products with predictions found. Generate price predictions in the Price Prediction tab first." 
                          : "Login to manage your products and run discount simulations."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
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
                      <Select
                        value={selectedProductId}
                        onValueChange={setSelectedProductId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product with prediction" />
                        </SelectTrigger>
                        <SelectContent>
                          {productOptions.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} {product.predictedPrice ? `($${product.predictedPrice.toFixed(2)})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      disabled={simulations.length === 0 && businessScenarios.length === 0}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                    
                    <div className="space-x-2">
                      <Button
                        onClick={runSimulation}
                        disabled={!selectedProductId}
                      >
                        Run Single Simulation <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      
                      <Button
                        onClick={generateBusinessScenarios}
                        disabled={!selectedProductId || isGeneratingScenarios}
                        variant="secondary"
                      >
                        <Play className="mr-2 h-4 w-4" /> 
                        {isGeneratingScenarios ? 'Generating...' : 'Generate All Scenarios'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {(latestSimulation || optimalScenario) && (
          <Card>
            <CardHeader>
              <CardTitle>{optimalScenario ? 'Optimal Scenario' : 'Latest Simulation'}</CardTitle>
              <CardDescription>
                {selectedProduct?.name || 'Product'} with {optimalScenario ? optimalScenario.discountPercentage : formatPercentage(discountRate)} discount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">Original Price</div>
                    <div className="text-lg font-bold">
                      {formatCurrency(optimalScenario ? optimalScenario.price / (1 - optimalScenario.discount) : latestSimulation?.originalPrice || 0)}
                    </div>
                  </div>
                  <div className="border p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">Discounted Price</div>
                    <div className="text-lg font-bold text-app-blue-500">
                      {formatCurrency(optimalScenario ? optimalScenario.price : latestSimulation?.discountedPrice || 0)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Expected Sales</div>
                  <div className="text-xl font-bold">
                    {formatNumber(optimalScenario ? optimalScenario.units : latestSimulation?.expectedSales || 0)} units
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">Expected Revenue</div>
                    <div className="text-lg font-bold">
                      {formatCurrency(optimalScenario ? optimalScenario.revenue : latestSimulation?.expectedRevenue || 0)}
                    </div>
                  </div>
                  <div className="border p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">Expected Profit</div>
                    <div className="text-lg font-bold">
                      {formatCurrency(optimalScenario ? optimalScenario.profit : latestSimulation?.expectedProfit || 0)}
                    </div>
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
      
      {businessScenarios.length > 0 && compareMode && (
        <Card>
          <CardHeader>
            <CardTitle>Business Strategy Scenarios</CardTitle>
            <CardDescription>Compare different discount and demand scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="discount" 
                      name="Discount" 
                      domain={[0, 0.35]}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      label={{ value: 'Discount Rate', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="demand" 
                      name="Demand" 
                      domain={[0.9, 2.1]}
                      tickFormatter={(value) => `${((value - 1) * 100).toFixed(0)}%`}
                      label={{ value: 'Demand Increase', angle: -90, position: 'insideLeft' }}
                    />
                    <ZAxis 
                      type="number" 
                      dataKey="profit" 
                      range={[50, 400]} 
                      name="Profit" 
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'Discount') return `${(Number(value) * 100).toFixed(0)}%`;
                        if (name === 'Demand') return `+${((Number(value) - 1) * 100).toFixed(0)}%`;
                        if (name === 'Profit') return formatCurrency(Number(value));
                        return value;
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-md shadow-md">
                              <p className="font-medium">Scenario Details</p>
                              <p>Discount: {data.discountPercentage}</p>
                              <p>Demand Increase: {data.demandIncrease}</p>
                              <p>Revenue: {formatCurrency(data.revenue)}</p>
                              <p>Profit: {formatCurrency(data.profit)}</p>
                              <p>Units Sold: {formatNumber(data.units)}</p>
                              {data === optimalScenario && (
                                <p className="font-bold text-green-600 mt-1">OPTIMAL SCENARIO</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      name="Scenarios" 
                      data={businessScenarios}
                      fill="#8884d8"
                    >
                      {businessScenarios.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry === optimalScenario ? '#4CAF50' : '#8884d8'} 
                          stroke={entry === optimalScenario ? '#2E7D32' : '#6657B3'}
                          strokeWidth={entry === optimalScenario ? 2 : 1}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <h4 className="font-medium mb-2">Top 5 Most Profitable Scenarios</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2">Rank</th>
                        <th className="text-left pb-2">Discount</th>
                        <th className="text-left pb-2">Demand Increase</th>
                        <th className="text-left pb-2">Price</th>
                        <th className="text-left pb-2">Units</th>
                        <th className="text-left pb-2">Revenue</th>
                        <th className="text-left pb-2">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {businessScenarios
                        .sort((a, b) => b.profit - a.profit)
                        .slice(0, 5)
                        .map((scenario, index) => (
                          <tr key={index} className={`border-b last:border-0 ${scenario === optimalScenario ? 'bg-green-50' : ''}`}>
                            <td className="py-2">{index + 1}</td>
                            <td className="py-2">{scenario.discountPercentage}</td>
                            <td className="py-2">{scenario.demandIncrease}</td>
                            <td className="py-2">{formatCurrency(scenario.price)}</td>
                            <td className="py-2">{formatNumber(scenario.units)}</td>
                            <td className="py-2">{formatCurrency(scenario.revenue)}</td>
                            <td className="py-2 font-medium">{formatCurrency(scenario.profit)}</td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {simulations.length > 0 && compareMode && !businessScenarios.length && (
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
                      <th className="text-left pb-2">Units</th>
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
                        <td className="py-2">{formatNumber(scenario.units)}</td>
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
    </div>
  );
};

export default DiscountSimulationTab;
