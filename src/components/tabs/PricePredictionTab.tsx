
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
import { Product, PricePrediction } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import ProductSelect from '../ProductSelect';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const PricePredictionTab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [adjustedPrice, setAdjustedPrice] = useState<number>(0);
  const [competitorPrices, setCompetitorPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load products
    const allProducts = dataService.getAllProducts();
    setProducts(allProducts);
    
    // If there are products, select the first one by default
    if (allProducts.length > 0) {
      setSelectedProductId(allProducts[0].id);
    }
    
    setLoading(false);
  }, []);
  
  useEffect(() => {
    if (!selectedProductId) return;
    
    // Get the selected product
    const product = dataService.getProductById(selectedProductId);
    if (product) {
      setSelectedProduct(product);
      
      // Get price prediction for this product
      const pricePred = dataService.predictOptimalPrice(selectedProductId);
      if (pricePred) {
        setPrediction(pricePred);
        setAdjustedPrice(pricePred.optimalPrice);
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
  }, [selectedProductId]);
  
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
  
  return (
    <div className="space-y-6">
      <div className="w-full md:w-1/3">
        <ProductSelect
          products={products}
          onProductSelect={setSelectedProductId}
          selectedProductId={selectedProductId}
          placeholder="Select a product for price prediction"
        />
      </div>
      
      {selectedProduct && prediction && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AI Price Recommendation</CardTitle>
                <CardDescription>Based on market factors analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
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
                  
                  <div className="space-y-2">
                    <Label>Adjust Recommended Price</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(prediction.optimalPrice * 0.8)}
                      </span>
                      <Slider
                        defaultValue={[prediction.optimalPrice]}
                        min={prediction.optimalPrice * 0.8}
                        max={prediction.optimalPrice * 1.2}
                        step={0.01}
                        onValueChange={handlePriceChange}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(prediction.optimalPrice * 1.2)}
                      </span>
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-sm font-medium">Adjusted Price</div>
                      <div className="text-xl font-bold">{formatCurrency(adjustedPrice)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Price Change Impact</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border p-3 rounded-md">
                        <div className="text-xs text-muted-foreground">From Base</div>
                        <div className={`text-lg font-bold ${prediction.optimalPrice > selectedProduct.basePrice ? 'text-green-500' : 'text-red-500'}`}>
                          {prediction.optimalPrice > selectedProduct.basePrice ? '+' : ''}
                          {formatPercentage((prediction.optimalPrice / selectedProduct.basePrice) - 1)}
                        </div>
                      </div>
                      <div className="border p-3 rounded-md">
                        <div className="text-xs text-muted-foreground">Potential Profit ↑</div>
                        <div className="text-lg font-bold text-green-500">
                          {formatPercentage((calculateProfit(prediction.optimalPrice) / calculateProfit(selectedProduct.basePrice)) - 1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Price Factors Analysis</CardTitle>
                <CardDescription>Factors that influenced the price recommendation</CardDescription>
              </CardHeader>
              <CardContent>
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
                
                <div className="grid grid-cols-2 gap-4 mt-4">
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
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
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
          </div>
        </>
      )}
    </div>
  );
};

export default PricePredictionTab;
