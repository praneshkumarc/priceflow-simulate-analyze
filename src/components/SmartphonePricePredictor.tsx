
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { Smartphone, Cpu } from 'lucide-react';
import { predictionService } from '@/services/predictionService';
import { useToast } from '@/hooks/use-toast';

interface SmartphonePricePredictorProps {
  model: any | null;
}

const SmartphonePricePredictor: React.FC<SmartphonePricePredictorProps> = ({ model }) => {
  const [specs, setSpecs] = useState({
    ram: '8GB',
    processor: 'Snapdragon 888',
    storage: '128GB',
    display: '6.1 inch OLED',
    camera: '12MP dual camera',
    battery: '4000mAh'
  });
  
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSpecChange = (spec: string, value: string) => {
    setSpecs(prev => ({ ...prev, [spec]: value }));
  };
  
  const predictPrice = () => {
    if (!model) return;
    
    setIsLoading(true);
    
    try {
      // Extract and normalize features using our KNN implementation
      const features = predictionService.extractSmartphoneFeatures(specs);
      
      // Use KNN to predict the price
      const { predictedPrice: knnPrice, confidence: knnConfidence } = 
        predictionService.predictPriceWithKNN(features, 3);
      
      setPredictedPrice(knnPrice);
      setConfidence(knnConfidence);
      
      // Save the prediction to the prediction service
      const productId = `smartphone-${specs.processor}-${specs.ram}-${specs.storage}`;
      const prediction = {
        productId,
        basePrice: knnPrice * 0.9, // Base price is 90% of the optimal price
        optimalPrice: knnPrice,
        confidence: knnConfidence,
        factors: {
          demandCoefficient: 0.8,
          competitorInfluence: 0.3,
          seasonalityFactor: 0.6,
          marginOptimization: 0.7
        },
        productCost: knnPrice * 0.6 // Estimate cost at 60% of price
      };
      
      predictionService.savePrediction(prediction);
      
      toast({
        title: "Price predicted with KNN",
        description: `Optimal price: ${formatCurrency(knnPrice)} (${knnConfidence}% confidence)`,
      });
    } catch (error) {
      console.error("KNN prediction error:", error);
      toast({
        title: "Prediction error",
        description: error instanceof Error ? error.message : "An error occurred during prediction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const ramOptions = ['4GB', '6GB', '8GB', '12GB', '16GB'];
  const processorOptions = ['MediaTek Helio', 'Snapdragon 765', 'Snapdragon 888', 'Snapdragon 8 Gen 1', 'A14 Bionic', 'A15 Bionic', 'Exynos 2200'];
  const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const displayOptions = ['5.4 inch LCD', '6.1 inch OLED', '6.5 inch AMOLED', '6.7 inch LTPO'];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Smartphone className="h-5 w-5" />
          <CardTitle>Smartphone Price Predictor</CardTitle>
        </div>
        <CardDescription>
          Enter smartphone specifications to predict its optimal price using K-Nearest Neighbors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ram">RAM</Label>
              <Select 
                value={specs.ram} 
                onValueChange={(value) => handleSpecChange('ram', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select RAM" />
                </SelectTrigger>
                <SelectContent>
                  {ramOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="processor">Processor</Label>
              <Select 
                value={specs.processor} 
                onValueChange={(value) => handleSpecChange('processor', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Processor" />
                </SelectTrigger>
                <SelectContent>
                  {processorOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storage">Storage</Label>
              <Select 
                value={specs.storage} 
                onValueChange={(value) => handleSpecChange('storage', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Storage" />
                </SelectTrigger>
                <SelectContent>
                  {storageOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display">Display</Label>
              <Select 
                value={specs.display} 
                onValueChange={(value) => handleSpecChange('display', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Display" />
                </SelectTrigger>
                <SelectContent>
                  {displayOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="camera">Camera</Label>
              <Input 
                id="camera" 
                value={specs.camera}
                onChange={(e) => handleSpecChange('camera', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="battery">Battery</Label>
              <Input 
                id="battery" 
                value={specs.battery}
                onChange={(e) => handleSpecChange('battery', e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={predictPrice}
            disabled={!model || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              <>
                <Cpu className="mr-2 h-4 w-4" />
                Predict Price with KNN
              </>
            )}
          </Button>
          
          {predictedPrice !== null && confidence !== null && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium mb-2">KNN Predicted Price</h3>
              <div className="text-3xl font-bold text-app-blue-500">{formatCurrency(predictedPrice)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Confidence: {confidence}% · Using 3-Nearest Neighbors algorithm
              </div>
            </div>
          )}
          
          {!model && (
            <div className="text-sm text-muted-foreground text-center p-2">
              Train a model first to enable price predictions
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartphonePricePredictor;
