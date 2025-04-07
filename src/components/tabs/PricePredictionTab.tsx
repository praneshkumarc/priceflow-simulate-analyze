import React, { useState, useEffect } from 'react';
import { ProductSelect } from '@/components/ProductSelect';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { dataService } from '@/services/dataService';
import { predictionService } from '@/services/predictionService';
import { useProductSelection } from '@/hooks/use-product-selection';
import { Product, PricePrediction } from '@/types';
import { Loader2, HelpCircle } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import PriceElasticityChart from '@/components/charts/PriceElasticityChart';
import PriceComparisonChart from '@/components/charts/PriceComparisonChart';
import ProfitProjectionChart from '@/components/charts/ProfitProjectionChart';

const PricePredictionTab: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [predictedPrice, setPredictedPrice] = useState<number | undefined>(undefined);
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [demandCoefficient, setDemandCoefficient] = useState<number>(0.8);
  const [competitorInfluence, setCompetitorInfluence] = useState<number>(0.1);
  const [seasonalityFactor, setSeasonalityFactor] = useState<number>(0.2);
  const [marginOptimization, setMarginOptimization] = useState<number>(0.15);
  const [discountRate, setDiscountRate] = useState<number>(0.1);
  const [expectedDemandIncrease, setExpectedDemandIncrease] = useState<number>(1.05);
  const [estimatedSales, setEstimatedSales] = useState<number>(100);
  const [profit, setProfit] = useState<number | undefined>(undefined);
  const [revenue, setRevenue] = useState<number | undefined>(undefined);
  const [productCost, setProductCost] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [priceOverride, setPriceOverride] = useState<number | undefined>(undefined);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);

  const { 
    allProducts, 
    userAddedProducts, 
    productsWithPredictions,
    predictedPrices,
    loading: productsLoading,
    savePrediction,
    savePricePredictionToSupabase
  } = useProductSelection();

  const products = userAddedProducts.length > 0 ? userAddedProducts : allProducts;
  const hasProducts = products && products.length > 0;

  useEffect(() => {
    if (selectedProductId) {
      const product = dataService.getProductById(selectedProductId);
      setOriginalPrice(product?.basePrice);
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (selectedProductId) {
      const savedPrediction = predictionService.getPredictionDetails(selectedProductId);
      if (savedPrediction) {
        setPredictedPrice(savedPrediction.optimalPrice);
        setConfidence(savedPrediction.confidence);
        setDemandCoefficient(savedPrediction.factors.demandCoefficient);
        setCompetitorInfluence(savedPrediction.factors.competitorInfluence);
        setSeasonalityFactor(savedPrediction.factors.seasonalityFactor);
        setMarginOptimization(savedPrediction.factors.marginOptimization);
        setProductCost(savedPrediction.productCost);
      } else {
        setPredictedPrice(undefined);
        setConfidence(undefined);
      }
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (selectedProductId && predictedPrice) {
      const calculatedProfit = predictionService.calculateProfit(selectedProductId, predictedPrice, estimatedSales);
      const calculatedRevenue = predictionService.calculateRevenue(predictedPrice, estimatedSales);
      setProfit(calculatedProfit);
      setRevenue(calculatedRevenue);
    } else {
      setProfit(undefined);
      setRevenue(undefined);
    }
  }, [selectedProductId, predictedPrice, estimatedSales]);

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    setPredictedPrice(undefined);
    setConfidence(undefined);
  };

  const handlePriceOverrideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPriceOverride(isNaN(value) ? undefined : value);
  };

  const handleSliderChange = (value: number[]) => {
    setEstimatedSales(value[0]);
  };

  const handleGeneratePrediction = async () => {
    if (!selectedProductId) return;

    setLoading(true);
    try {
      const product = dataService.getProductById(selectedProductId);
      if (!product) {
        console.error("Product not found");
        return;
      }

      const prediction: PricePrediction = {
        productId: product.id,
        basePrice: product.basePrice,
        optimalPrice: priceOverride !== undefined ? priceOverride : product.basePrice * (1 + marginOptimization) * (1 + seasonalityFactor) - (competitorInfluence * 5),
        confidence: 75 + (seasonalityFactor * 10),
        factors: {
          demandCoefficient,
          competitorInfluence,
          seasonalityFactor,
          marginOptimization
        },
        productCost: productCost || product.cost
      };

      setPredictedPrice(prediction.optimalPrice);
      setConfidence(prediction.confidence);
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrediction = async () => {
    if (!selectedProductId || !predictedPrice || !confidence) return;

    setIsSaving(true);
    try {
      const product = dataService.getProductById(selectedProductId);
      if (!product) {
        console.error("Product not found");
        return;
      }

      const prediction: PricePrediction = {
        productId: product.id,
        basePrice: product.basePrice,
        optimalPrice: predictedPrice,
        confidence: confidence,
        factors: {
          demandCoefficient,
          competitorInfluence,
          seasonalityFactor,
          marginOptimization
        },
        productCost: productCost || product.cost
      };

      const saved = await savePrediction(selectedProductId, prediction);
      if (saved) {
        console.log("Prediction saved successfully");
      } else {
        console.error("Failed to save prediction");
      }
    } catch (error) {
      console.error("Error saving prediction:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const priceElasticityData = React.useMemo(() => {
    const basePrice = originalPrice || 50;
    const elasticity = -1.5;
    const data = [];
    for (let price = basePrice * 0.5; price <= basePrice * 1.5; price += basePrice * 0.05) {
      const priceChangePercent = (price - basePrice) / basePrice;
      const demandChangePercent = priceChangePercent * elasticity;
      const demand = estimatedSales * (1 + demandChangePercent);
      data.push({ price, demand });
    }
    return data;
  }, [originalPrice, estimatedSales]);

  const priceComparisonData = React.useMemo(() => {
    const basePrice = originalPrice || 50;
    const predicted = predictedPrice || basePrice * 1.1;
    return [
      { name: 'Original Price', price: basePrice },
      { name: 'Predicted Price', price: predicted },
    ];
  }, [originalPrice, predictedPrice]);

  const profitProjectionData = React.useMemo(() => {
    const basePrice = originalPrice || 50;
    const predicted = predictedPrice || basePrice * 1.1;
    const cost = productCost || basePrice * 0.5;
    const data = [];
    for (let price = basePrice * 0.7; price <= predicted * 1.2; price += basePrice * 0.05) {
      const estimatedSales = 100;
      const revenue = price * estimatedSales;
      const profit = (price - cost) * estimatedSales;
      data.push({ price, revenue, profit });
    }
    return data;
  }, [originalPrice, predictedPrice, productCost]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Price Prediction</CardTitle>
          <CardDescription>
            Select a product to generate a price prediction.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ProductSelect
            products={products}
            onProductSelect={handleProductSelect}
            selectedProductId={selectedProductId}
            placeholder={hasProducts ? "Select a product" : "No products available"}
            showPrices={true}
            predictedPrices={predictedPrices}
          />
          {selectedProductId && (
            <div className="grid gap-2">
              <Label htmlFor="priceOverride">
                Price Override
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 inline-block ml-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Manually set the price for prediction.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                type="number"
                id="priceOverride"
                placeholder="Enter price"
                value={priceOverride !== undefined ? priceOverride.toString() : ""}
                onChange={handlePriceOverrideChange}
              />
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full" 
            variant="default" 
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Generate Prediction
          </Button>
          {predictedPrice !== undefined && (
            <div className="grid gap-2">
              <Label>Predicted Price</Label>
              <Input
                type="text"
                value={`$${predictedPrice.toFixed(2)}`}
                readOnly
              />
            </div>
          )}
          {confidence !== undefined && (
            <div className="grid gap-2">
              <Label>Confidence</Label>
              <Input
                type="text"
                value={`${confidence.toFixed(2)}%`}
                readOnly
              />
            </div>
          )}
          {predictedPrice !== undefined && (
            <Button 
              type="button" 
              className="w-full" 
              variant="secondary" 
              disabled={isSaving} 
              onClick={handleSavePrediction}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Prediction
            </Button>
          )}
        </CardContent>
      </Card>

      {selectedProductId && predictedPrice !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Profit and Revenue Estimation</CardTitle>
            <CardDescription>
              Adjust the estimated sales to see the impact on profit and revenue.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="estimatedSales">Estimated Sales</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 inline-block ml-1" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Adjust the slider to estimate the number of sales.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Slider
                defaultValue={[estimatedSales]}
                max={200}
                step={1}
                onValueChange={handleSliderChange}
                aria-label="Estimated Sales"
              />
              <Input
                type="text"
                value={estimatedSales.toString()}
                readOnly
              />
            </div>
            {profit !== undefined && revenue !== undefined && (
              <>
                <div className="grid gap-2">
                  <Label>Estimated Profit</Label>
                  <Input
                    type="text"
                    value={`$${profit.toFixed(2)}`}
                    readOnly
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Estimated Revenue</Label>
                  <Input
                    type="text"
                    value={`$${revenue.toFixed(2)}`}
                    readOnly
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {selectedProductId && predictedPrice !== undefined && (
        <Tabs defaultValue="priceElasticity" className="w-full">
          <TabsList>
            <TabsTrigger value="priceElasticity">Price Elasticity</TabsTrigger>
            <TabsTrigger value="priceComparison">Price Comparison</TabsTrigger>
            <TabsTrigger value="profitProjection">Profit Projection</TabsTrigger>
          </TabsList>
          <TabsContent value="priceElasticity">
            <PriceElasticityChart data={priceElasticityData} />
          </TabsContent>
          <TabsContent value="priceComparison">
            <PriceComparisonChart data={priceComparisonData} />
          </TabsContent>
          <TabsContent value="profitProjection">
            <ProfitProjectionChart data={profitProjectionData} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PricePredictionTab;
