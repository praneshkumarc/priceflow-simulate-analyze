
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { Smartphone } from 'lucide-react';

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
  
  const handleSpecChange = (spec: string, value: string) => {
    setSpecs(prev => ({ ...prev, [spec]: value }));
  };
  
  const predictPrice = () => {
    if (!model) return;
    
    const price = model.predict(specs);
    setPredictedPrice(price);
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
          Enter smartphone specifications to predict its optimal price
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
            disabled={!model}
            className="w-full"
          >
            Predict Price
          </Button>
          
          {predictedPrice !== null && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium mb-2">Predicted Price</h3>
              <div className="text-3xl font-bold text-app-blue-500">{formatCurrency(predictedPrice)}</div>
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
