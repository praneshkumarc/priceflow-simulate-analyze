import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowRight, CheckCircle2, DollarSign, LineChart, Percent, TrendingUp } from 'lucide-react';
import { useProductSelection } from '@/hooks/use-product-selection';
import { predictionService } from '@/services/predictionService';
import { Product, PriceFactors, PricePrediction } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import PriceElasticityChart from '@/components/charts/PriceElasticityChart';
import PriceComparisonChart from '@/components/charts/PriceComparisonChart';
import ProfitProjectionChart from '@/components/charts/ProfitProjectionChart';
import { useToast } from '@/hooks/use-toast';

const PricePredictionTab: React.FC = () => {
  const { userAddedProducts, savePrediction, predictedPrices, loading } = useProductSelection();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [optimizedPrice, setOptimizedPrice] = useState<number | null>(null);
  const [manualPrice, setManualPrice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(85);
  const [priceFactors, setPriceFactors] = useState<PriceFactors>({
    demandCoefficient: 0.7,
    competitorInfluence: 0.5,
    seasonalityFactor: 0.3,
    marginOptimization: 0.8,
  });
  const [predictionSaved, setPredictionSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('automatic');
  const [productCost, setProductCost] = useState<number>(0);
  const { toast } = useToast();

  // Update product cost when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      setProductCost(selectedProduct.cost);
      
      // Check if there's a saved prediction for this product
      const savedPrice = predictedPrices[selectedProduct.id];
      if (savedPrice) {
        setOptimizedPrice(savedPrice);
        setManualPrice(savedPrice);
        
        // Get full prediction details if available
        const predictionDetails = predictionService.getPredictionDetails(selectedProduct.id);
        if (predictionDetails) {
          setPriceFactors(predictionDetails.factors);
          setConfidence(predictionDetails.confidence);
        }
      } else {
        // Reset to defaults if no prediction exists
        setOptimizedPrice(null);
        setManualPrice(selectedProduct.basePrice);
        setPriceFactors({
          demandCoefficient: 0.7,
          competitorInfluence: 0.5,
          seasonalityFactor: 0.3,
          marginOptimization: 0.8,
        });
        setConfidence(85);
      }
      
      setPredictionSaved(false);
    }
  }, [selectedProduct, predictedPrices]);

  const handleProductChange = (productId: string) => {
    const product = userAddedProducts.find(p => p.id === productId) || null;
    setSelectedProduct(product);
  };

  const handleFactorChange = (factor: keyof PriceFactors, value: number) => {
    setPriceFactors(prev => ({
      ...prev,
      [factor]: value,
    }));
  };

  const calculateOptimalPrice = () => {
    if (!selectedProduct) return;

    // Simple price optimization algorithm
    const basePrice = selectedProduct.basePrice;
    const cost = productCost;
    
    // Calculate weighted factors
    const demandFactor = 1 - (priceFactors.demandCoefficient * 0.2); // Higher demand coefficient reduces price less
    const competitorFactor = 1 - (priceFactors.competitorInfluence * 0.1); // Higher competitor influence reduces price more
    const seasonalFactor = 1 + (priceFactors.seasonalityFactor * 0.15); // Higher seasonality increases price
    const marginFactor = 1 + (priceFactors.marginOptimization * 0.25); // Higher margin optimization increases price
    
    // Calculate optimal price with minimum margin protection
    const minMargin = 1.2; // Minimum 20% margin over cost
    const calculatedPrice = basePrice * demandFactor * competitorFactor * seasonalFactor * marginFactor;
    const minPrice = cost * minMargin;
    
    // Ensure price is at least the minimum margin above cost
    const optimal = Math.max(calculatedPrice, minPrice);
    setOptimizedPrice(optimal);
    
    // Also update manual price to match
    setManualPrice(optimal);
    
    // Reset saved state
    setPredictionSaved(false);
  };

  const handleManualPriceChange = (value: string) => {
    const price = parseFloat(value);
    if (!isNaN(price) && price > 0) {
      setManualPrice(price);
      setPredictionSaved(false);
    }
  };

  const handleSavePrediction = async () => {
    if (!selectedProduct || !manualPrice) return;
    
    // Create prediction object
    const prediction: PricePrediction = {
      productId: selectedProduct.id,
      basePrice: selectedProduct.basePrice,
      optimalPrice: manualPrice,
      confidence: confidence,
      factors: priceFactors,
      productCost: productCost
    };
    
    // Save prediction
    const success = await savePrediction(selectedProduct.id, prediction);
    
    if (success) {
      // Also save to local prediction service for immediate use
      predictionService.savePrediction(prediction);
      setPredictionSaved(true);
      
      toast({
        title: "Price Saved",
        description: `Optimal price of ${formatCurrency(manualPrice)} saved for ${selectedProduct.name}`,
      });
    }
  };

  // Calculate profit margin
  const calculateMargin = (price: number) => {
    if (!selectedProduct || price <= 0 || productCost <= 0) return 0;
    return (price - productCost) / price * 100;
  };

  // Calculate estimated monthly sales at a given price
  const estimateSales = (price: number) => {
    if (!selectedProduct || price <= 0) return 0;
    
    // Simple demand curve: higher price = lower sales
    const baseQuantity = 100; // Base monthly sales
    const elasticity = 1.5; // Price elasticity
    const basePrice = selectedProduct.basePrice;
    
    // Calculate quantity based on price elasticity
    // Q = Q0 * (P/P0)^(-e) where e is elasticity
    return Math.round(baseQuantity * Math.pow(basePrice / price, elasticity));
  };

  // Calculate estimated monthly profit
  const estimateProfit = (price: number) => {
    const sales = estimateSales(price);
    return (price - productCost) * sales;
  };

  // Get optimal price or fallback to base price
  const getOptimalPrice = () => {
    return optimizedPrice || (selectedProduct ? selectedProduct.basePrice : 0);
  };

  // Get price points for comparison
  const getPricePoints = () => {
    if (!selectedProduct) return [];
    
    const optimal = getOptimalPrice();
    const base = selectedProduct.basePrice;
    const cost = productCost;
    
    return [
      { name: 'Cost', value: cost },
      { name: 'Base', value: base },
      { name: 'Optimal', value: optimal },
    ];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Price Prediction</CardTitle>
          <CardDescription>
            Optimize pricing for your products using AI-driven analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product-select">Select Product</Label>
              <Select
                value={selectedProduct?.id || ''}
                onValueChange={handleProductChange}
                disabled={loading || userAddedProducts.length === 0}
              >
                <SelectTrigger id="product-select">
                  <SelectValue placeholder="Choose a product to optimize" />
                </SelectTrigger>
                <SelectContent>
                  {userAddedProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({formatCurrency(product.basePrice)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {userAddedProducts.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground mt-2">
                  No products found. Please add products in the Product Management tab.
                </p>
              )}
            </div>

            {selectedProduct && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Base Price</Label>
                    <div className="text-2xl font-bold">
                      {formatCurrency(selectedProduct.basePrice)}
                    </div>
                    <p className="text-sm text-muted-foreground">Current price</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Product Cost</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={productCost}
                        onChange={(e) => setProductCost(parseFloat(e.target.value) || 0)}
                        className="text-lg font-medium"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Manufacturing/acquisition cost</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Margin</Label>
                    <div className="text-2xl font-bold">
                      {formatPercentage(calculateMargin(selectedProduct.basePrice))}
                    </div>
                    <p className="text-sm text-muted-foreground">Based on cost and base price</p>
                  </div>
                </div>

                <Separator />

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="automatic">Automatic Optimization</TabsTrigger>
                    <TabsTrigger value="manual">Manual Adjustment</TabsTrigger>
                  </TabsList>
                  <TabsContent value="automatic" className="space-y-6 pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Demand Sensitivity</Label>
                          <span className="text-sm">{(priceFactors.demandCoefficient * 100).toFixed(0)}%</span>
                        </div>
                        <Slider
                          value={[priceFactors.demandCoefficient * 100]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(value) => handleFactorChange('demandCoefficient', value[0] / 100)}
                        />
                        <p className="text-xs text-muted-foreground">
                          How sensitive are customers to price changes?
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Competitor Influence</Label>
                          <span className="text-sm">{(priceFactors.competitorInfluence * 100).toFixed(0)}%</span>
                        </div>
                        <Slider
                          value={[priceFactors.competitorInfluence * 100]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(value) => handleFactorChange('competitorInfluence', value[0] / 100)}
                        />
                        <p className="text-xs text-muted-foreground">
                          How much do competitor prices affect your sales?
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Seasonality Impact</Label>
                          <span className="text-sm">{(priceFactors.seasonalityFactor * 100).toFixed(0)}%</span>
                        </div>
                        <Slider
                          value={[priceFactors.seasonalityFactor * 100]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(value) => handleFactorChange('seasonalityFactor', value[0] / 100)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Is this product currently in high season?
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Margin Optimization</Label>
                          <span className="text-sm">{(priceFactors.marginOptimization * 100).toFixed(0)}%</span>
                        </div>
                        <Slider
                          value={[priceFactors.marginOptimization * 100]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(value) => handleFactorChange('marginOptimization', value[0] / 100)}
                        />
                        <p className="text-xs text-muted-foreground">
                          How important is maximizing profit margin vs. volume?
                        </p>
                      </div>

                      <Button 
                        onClick={calculateOptimalPrice}
                        className="w-full"
                      >
                        <LineChart className="mr-2 h-4 w-4" />
                        Calculate Optimal Price
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="manual" className="space-y-6 pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="manual-price">Price</Label>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="manual-price"
                            type="number"
                            value={manualPrice || ''}
                            onChange={(e) => handleManualPriceChange(e.target.value)}
                            className="text-lg font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Profit Margin</Label>
                        <div className="flex items-center space-x-2">
                          <div className="text-xl font-bold">
                            {formatPercentage(calculateMargin(manualPrice || 0))}
                          </div>
                          <Badge variant={calculateMargin(manualPrice || 0) > 30 ? "success" : "default"}>
                            {calculateMargin(manualPrice || 0) > calculateMargin(selectedProduct.basePrice) 
                              ? "Improved" 
                              : "Reduced"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {calculateMargin(manualPrice || 0) > 30 
                            ? "Healthy margin" 
                            : "Consider increasing price to improve margin"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Estimated Monthly Sales</Label>
                        <div className="text-xl font-bold">
                          {estimateSales(manualPrice || 0).toLocaleString()} units
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Based on price elasticity model
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Estimated Monthly Profit</Label>
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(estimateProfit(manualPrice || 0))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          (Price - Cost) × Estimated Sales
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Prediction Confidence</Label>
                        <div className="flex items-center space-x-2">
                          <Slider
                            value={[confidence]}
                            min={50}
                            max={100}
                            step={5}
                            onValueChange={(value) => setConfidence(value[0])}
                          />
                          <span className="w-12 text-right">{confidence}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          How confident are you in this price prediction?
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {optimizedPrice !== null && (
                  <div className="bg-muted rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Optimal Price</h3>
                        <p className="text-sm text-muted-foreground">
                          {optimizedPrice > selectedProduct.basePrice 
                            ? "Price increase recommended" 
                            : "Price decrease recommended"}
                        </p>
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(optimizedPrice)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Change</div>
                        <div className={`text-lg font-bold ${
                          optimizedPrice > selectedProduct.basePrice ? "text-green-600" : "text-red-600"
                        }`}>
                          {formatPercentage((optimizedPrice / selectedProduct.basePrice - 1) * 100)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Margin</div>
                        <div className="text-lg font-bold">
                          {formatPercentage(calculateMargin(optimizedPrice))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Est. Profit</div>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(estimateProfit(optimizedPrice))}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSavePrediction}
                      className="w-full"
                      disabled={predictionSaved}
                    >
                      {predictionSaved ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Price Saved
                        </>
                      ) : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Save Price Prediction
                        </>
                      )}
                    </Button>
                    
                    {predictionSaved && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Price prediction saved</AlertTitle>
                        <AlertDescription className="text-green-700">
                          This price will be used in reports and dashboards
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedProduct && optimizedPrice && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Price Elasticity Analysis</CardTitle>
              <CardDescription>
                Impact of price changes on sales volume and profit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <PriceElasticityChart 
                  basePrice={selectedProduct.basePrice}
                  optimalPrice={optimizedPrice}
                  productCost={productCost}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Price Comparison</CardTitle>
              <CardDescription>
                Comparing cost, base, and optimal prices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <PriceComparisonChart 
                  pricePoints={getPricePoints()}
                  margins={{
                    base: calculateMargin(selectedProduct.basePrice),
                    optimal: calculateMargin(optimizedPrice)
                  }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profit Projection</CardTitle>
              <CardDescription>
                Projected profit at different price points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ProfitProjectionChart 
                  basePrice={selectedProduct.basePrice}
                  optimalPrice={optimizedPrice}
                  productCost={productCost}
                  productName={selectedProduct.name}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PricePredictionTab;
