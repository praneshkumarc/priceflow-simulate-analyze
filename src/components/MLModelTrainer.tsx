
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { formatPercentage } from '@/utils/formatters';
import { MLModelParams, FeatureImportance } from '@/types';
import { toast } from '@/hooks/use-toast';

interface MLModelTrainerProps {
  dataset: any[] | null;
  onModelTrained: (model: any) => void;
}

const MLModelTrainer: React.FC<MLModelTrainerProps> = ({ dataset, onModelTrained }) => {
  const [modelParams, setModelParams] = useState<MLModelParams>({
    learningRate: 0.01,
    epochs: 100,
    features: ['ram', 'processor', 'storage', 'display', 'camera', 'battery'],
    targetVariable: 'price'
  });
  
  const [isTraining, setIsTraining] = useState(false);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  
  const availableFeatures = [
    { id: 'ram', label: 'RAM' },
    { id: 'processor', label: 'Processor' },
    { id: 'storage', label: 'Storage' },
    { id: 'display', label: 'Display Size' },
    { id: 'camera', label: 'Camera Quality' },
    { id: 'battery', label: 'Battery Capacity' }
  ];
  
  const handleFeatureToggle = (feature: string) => {
    setModelParams(prev => {
      if (prev.features.includes(feature)) {
        return { ...prev, features: prev.features.filter(f => f !== feature) };
      } else {
        return { ...prev, features: [...prev.features, feature] };
      }
    });
  };
  
  // Simplified ML model training simulation
  const trainModel = () => {
    if (!dataset || dataset.length === 0) {
      toast({
        title: "No dataset available",
        description: "Please upload a dataset before training the model",
        variant: "destructive",
      });
      return;
    }
    
    setIsTraining(true);
    
    // Simulate ML training with a timeout
    setTimeout(() => {
      try {
        // Generate mock feature importance
        const mockImportance = modelParams.features.map(feature => ({
          feature,
          importance: Math.random()
        }));
        
        // Normalize importance values to sum to 100%
        const totalImportance = mockImportance.reduce((sum, item) => sum + item.importance, 0);
        const normalizedImportance = mockImportance.map(item => ({
          feature: item.feature,
          importance: item.importance / totalImportance
        }));
        
        // Sort by importance descending
        normalizedImportance.sort((a, b) => b.importance - a.importance);
        
        setFeatureImportance(normalizedImportance);
        
        // Mock accuracy between 75% and 95%
        const mockAccuracy = 75 + Math.random() * 20;
        setAccuracy(mockAccuracy);
        
        // Create mock model object
        const mockModel = {
          params: modelParams,
          featureImportance: normalizedImportance,
          accuracy: mockAccuracy,
          trainedOn: new Date().toISOString(),
          predict: (features: Record<string, any>) => {
            // Very simple mock prediction logic
            let basePrice = 500;
            
            if (features.ram?.includes('8')) basePrice += 100;
            if (features.ram?.includes('12')) basePrice += 200;
            if (features.ram?.includes('16')) basePrice += 300;
            
            if (features.storage?.includes('128')) basePrice += 50;
            if (features.storage?.includes('256')) basePrice += 150;
            if (features.storage?.includes('512')) basePrice += 250;
            
            if (features.processor?.includes('Snapdragon')) basePrice += 100;
            if (features.processor?.includes('A15')) basePrice += 200;
            
            // Random factor (+-10%)
            const randomFactor = 0.9 + Math.random() * 0.2;
            return basePrice * randomFactor;
          }
        };
        
        onModelTrained(mockModel);
        
        toast({
          title: "Model training complete",
          description: `Model trained with ${mockAccuracy.toFixed(1)}% accuracy`,
        });
      } catch (error) {
        console.error("Error in model training:", error);
        toast({
          title: "Model training failed",
          description: "There was an error training the model. Please check your data and try again.",
          variant: "destructive",
        });
      } finally {
        setIsTraining(false);
      }
    }, 2000); // Simulate 2 seconds of training
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Train ML Model</CardTitle>
          <CardDescription>
            Configure and train a machine learning model to predict smartphone prices
            based on specifications and historical data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Learning Rate</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  value={[modelParams.learningRate * 100]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setModelParams(prev => ({ ...prev, learningRate: value[0] / 100 }))}
                  className="flex-1"
                />
                <span className="w-12 text-right">{modelParams.learningRate}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Training Epochs</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  value={[modelParams.epochs]}
                  min={10}
                  max={500}
                  step={10}
                  onValueChange={(value) => setModelParams(prev => ({ ...prev, epochs: value[0] }))}
                  className="flex-1"
                />
                <span className="w-12 text-right">{modelParams.epochs}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Features to Include</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature.id}`}
                      checked={modelParams.features.includes(feature.id)}
                      onCheckedChange={() => handleFeatureToggle(feature.id)}
                    />
                    <label
                      htmlFor={`feature-${feature.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {feature.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={trainModel} 
                disabled={isTraining || !dataset || modelParams.features.length === 0}
                className="w-full"
              >
                {isTraining ? "Training..." : "Train Model"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {featureImportance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Model Analysis</CardTitle>
            <CardDescription>
              Feature importance and model performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Model Accuracy</h4>
                <div className="text-2xl font-bold">{accuracy?.toFixed(1)}%</div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Feature Importance</h4>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={featureImportance}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => formatPercentage(value)} />
                      <YAxis type="category" dataKey="feature" />
                      <Tooltip 
                        formatter={(value) => formatPercentage(Number(value))}
                      />
                      <Bar dataKey="importance" fill="#8884d8">
                        {featureImportance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`#${Math.floor(index * 30 + 100).toString(16)}84d8`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MLModelTrainer;
