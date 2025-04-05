
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { dataService } from '@/services/dataService';
import { Product, PricePrediction, SmartphoneInputData } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import ProductSelect from '../ProductSelect';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Cpu, LineChart as LineChartIcon } from 'lucide-react';
import { useProductSelection } from '@/hooks/use-product-selection';
import { useAuth } from '@/contexts/AuthContext';

const PricePredictionTab: React.FC = () => {
  const { userAddedProducts, predictedPrices, savePrediction, refreshProducts } = useProductSelection();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [adjustedPrice, setAdjustedPrice] = useState<number>(0);
  const [competitorPrices, setCompetitorPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingFeatures, setProcessingFeatures] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [profitMargin, setProfitMargin] = useState<number>(30); // Default 30%
  const [knnPredictedPrice, setKnnPredictedPrice] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    // Extract unique models from the dataset
    const dataset = dataService.getDataset();
    if (dataset && dataset.length > 0) {
      const uniqueModels = [...new Set(dataset.map(item => item.Model))];
      setModels(uniqueModels);
    }
    
    // If there are user products, select the first one by default
    if (userAddedProducts.length > 0) {
      setSelectedProductId(userAddedProducts[0].id);
    }
    
    setLoading(false);
  }, [userAddedProducts]);
  
  useEffect(() => {
    if (!selectedProductId) return;
    
    // Get the selected product from user's products
    const product = userAddedProducts.find(p => p.id === selectedProductId);
    if (product) {
      setSelectedProduct(product);
      
      // Get price prediction for this product
      const pricePred = dataService.predictOptimalPrice(selectedProductId);
      if (pricePred) {
        setPrediction(pricePred);
        setAdjustedPrice(pricePred.optimalPrice);
        setBasePrice(pricePred.basePrice);
        
        // Save the prediction to the database
        savePrediction(selectedProductId, pricePred).then(() => {
          // Refresh products with predictions after saving
          refreshProducts();
        });
      }
      
      // Get competitor prices
      const compPrices = dataService.getCompetitorPrices(selectedProductId);
      const compData = compPrices.reduce((acc, comp) => {
        if (!acc[comp.competitorName]) {
          acc[comp.competitorName] = [];
        }
        acc[comp.competitorName].push(comp);
        return acc;
      }, {} as Record<string, any[]>);
      
      // Get average price per competitor
      const avgCompPrices = Object.entries(compData).map(([name, prices]) => {
        const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
        return {
          name,
          price: Math.round(avgPrice * 100) / 100
        };
      });
      
      if (product) {
        // Add our base price and optimal price for comparison
        avgCompPrices.push({
          name: "Our Base Price",
          price: product.basePrice
        });
        
        if (pricePred) {
          avgCompPrices.push({
            name: "AI Suggested",
            price: pricePred.optimalPrice
          });
        }
      }
      
      setCompetitorPrices(avgCompPrices);
    }
  }, [selectedProductId, userAddedProducts]);
  
  // Prepare data for the factors radar chart
  const radarData = prediction ? [
    { subject: 'Demand', A: prediction.factors.demandCoefficient * 100, fullMark: 100 },
    { subject: 'Competition', A: (prediction.factors.competitorInfluence + 0.2) * 100, fullMark: 100 },
    { subject: 'Seasonality', A: prediction.factors.seasonalityFactor * 100, fullMark: 100 },
    { subject: 'Margin', A: (prediction.factors.marginOptimization + 0.15) * 100, fullMark: 100 },
  ] : [];
  
  const handlePriceChange = (value: number[]) => {
    setAdjustedPrice(value[0]);
  };
  
  // Calculate profit at different prices
  const calculateProfit = (price: number): number => {
    if (!selectedProduct) return 0;
    
    const cost = selectedProduct.cost;
    const unitProfit = price - cost;
    
    // Simplified demand model - lower as price increases
    const priceFactor = prediction ? price / prediction.optimalPrice : 1;
    const estimatedSales = 100 * Math.pow(0.9, priceFactor - 1);  // Demand decreases as price increases
    
    return unitProfit * estimatedSales;
  };
  
  // Generate profit curve data points
  const generateProfitCurve = (): any[] => {
    if (!selectedProduct || !prediction) return [];
    
    const baseCost = selectedProduct.cost;
    const basePrice = selectedProduct.basePrice;
    const optimalPrice = prediction.optimalPrice;
    
    // Generate price points from 80% to 120% of base price
    const minPrice = Math.max(baseCost * 1.1, basePrice * 0.8);
    const maxPrice = basePrice * 1.3;
    const step = (maxPrice - minPrice) / 20;
    
    const data = [];
    for (let price = minPrice; price <= maxPrice; price += step) {
      data.push({
        price: Math.round(price * 100) / 100,
        profit: calculateProfit(price)
      });
    }
    
    return data;
  };
  
  const profitCurveData = generateProfitCurve();
  
  // Run KNN price prediction
  const predictPriceWithKNN = () => {
    if (!selectedModel || basePrice <= 0) {
      toast({
        title: "Missing Information",
        description: "Please select a model and enter a base price",
        variant: "destructive"
      });
      return;
    }
    
    // Show loading indicator
    setProcessingFeatures(true);
    
    // Simulate extraction process (in real app, this would be more complex)
    setTimeout(() => {
      try {
        // Get predicted price using KNN algorithm
        const predictedPrice = dataService.predictPrice(selectedModel, basePrice, profitMargin);
        setKnnPredictedPrice(predictedPrice);
        
        toast({
          title: "Prediction Complete",
          description: `Predicted optimal price: ${formatCurrency(predictedPrice)}`,
        });
      } catch (error) {
        console.error("Prediction error:", error);
        toast({
          title: "Prediction Error",
          description: error instanceof Error ? error.message : "Error predicting price",
          variant: "destructive"
        });
      } finally {
        setProcessingFeatures(false);
      }
    }, 2000); // Simulate processing time
  };
  
  return (
    <div className="space-y-6">
      {!user && (
        <Card>
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                You need to be logged in to predict prices for your products.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Standard Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Standard Price Prediction</CardTitle>
            <CardDescription>Select a product from your inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userAddedProducts.length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    {user ? "No products found. Add products in the Products tab first." 
                          : "Login to manage your products and run price predictions."}
                  </p>
                </div>
              ) : (
                <ProductSelect
                  products={userAddedProducts}
                  onProductSelect={setSelectedProductId}
                  selectedProductId={selectedProductId}
                  placeholder="Select a product for price prediction"
                />
              )}
              
              {selectedProduct && prediction && (
                <div className="space-y-4 mt-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Base Price</div>
                      <div className="text-2xl font-bold">{formatCurrency(selectedProduct.basePrice)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Optimal Price</div>
                      <div className="text-2xl font-bold text-app-blue-500">{formatCurrency(prediction.optimalPrice)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Confidence</div>
                      <div className="text-2xl font-bold">{prediction.confidence}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Advanced KNN Prediction */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced KNN Price Prediction</CardTitle>
            <CardDescription>Select a model and enter price parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Product Model</Label>
                <Select 
                  value={selectedModel} 
                  onValueChange={setSelectedModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profitMargin">Target Profit Margin (%)</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="profitMargin"
                      value={[profitMargin]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => setProfitMargin(value[0])}
                      className="flex-1"
                    />
                    <span className="w-10 text-right">{profitMargin}%</span>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={predictPriceWithKNN}
                disabled={processingFeatures || !selectedModel || basePrice <= 0}
              >
                {processingFeatures ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting Features...
                  </>
                ) : (
                  <>
                    <Cpu className="mr-2 h-4 w-4" />
                    Predict Price with KNN
                  </>
                )}
              </Button>
              
              {knnPredictedPrice !== null && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-800">KNN Predicted Price</div>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(knnPredictedPrice)}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Predicted using K-Nearest Neighbors algorithm
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Price Factors Analysis */}
      {selectedProduct && prediction && (
        <Card>
          <CardHeader>
            <CardTitle>Price Factors Analysis</CardTitle>
            <CardDescription>Factors that influenced the price recommendation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} width={400} height={250} data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Price Factors"
                      dataKey="A"
                      stroke="#3aa4ff"
                      fill="#3aa4ff"
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Demand Coefficient</div>
                    <div className="text-base">
                      {formatPercentage(prediction.factors.demandCoefficient)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Competitor Influence</div>
                    <div className="text-base">
                      {formatPercentage(prediction.factors.competitorInfluence + 0.2)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Seasonality Factor</div>
                    <div className="text-base">
                      {formatPercentage(prediction.factors.seasonalityFactor)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Margin Optimization</div>
                    <div className="text-base">
                      {formatPercentage(prediction.factors.marginOptimization + 0.15)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Price Recommendations</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border p-3 rounded-md">
                      <div className="text-xs text-muted-foreground">Standard Model</div>
                      <div className="text-lg font-bold text-app-blue-500">
                        {formatCurrency(prediction.optimalPrice)}
                      </div>
                    </div>
                    {knnPredictedPrice !== null && (
                      <div className="border p-3 rounded-md">
                        <div className="text-xs text-muted-foreground">KNN Model</div>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(knnPredictedPrice)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Price Comparison */}
        {selectedProduct && prediction && (
          <Card>
            <CardHeader>
              <CardTitle>Price Comparison</CardTitle>
              <CardDescription>Your price vs. competitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={competitorPrices}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="price" name="Price">
                      {competitorPrices.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === "Our Base Price" 
                            ? "#3aa4ff" 
                            : entry.name === "AI Suggested" 
                              ? "#4ac0c0" 
                              : "#8884d8"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Profit Optimization Curve */}
        {selectedProduct && prediction && (
          <Card>
            <CardHeader>
              <CardTitle>Profit Optimization Curve</CardTitle>
              <CardDescription>Estimated profit at different price points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitCurveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="price" 
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(Number(value)), 'Estimated Profit']}
                      labelFormatter={(value) => `Price: ${formatCurrency(Number(value))}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#4ac0c0" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PricePredictionTab;
