import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DatasetUploader from '@/components/DatasetUploader';
import MLModelTrainer from '@/components/MLModelTrainer';
import SmartphonePricePredictor from '@/components/SmartphonePricePredictor';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Database, LineChart } from 'lucide-react';

const SmartphoneDataTab: React.FC = () => {
  const [dataset, setDataset] = useState<any[] | null>(null);
  const [trainedModel, setTrainedModel] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('data-upload');
  const { toast } = useToast();
  
  const handleDatasetProcessed = (data: any[]) => {
    setDataset(data);
    toast({
      title: "Dataset ready",
      description: `${data.length} records loaded and ready for analysis`,
    });
    setActiveTab('model-training');
  };
  
  const handleModelTrained = (model: any) => {
    setTrainedModel(model);
    toast({
      title: "Model trained successfully",
      description: "You can now proceed to price prediction",
    });
    setActiveTab('price-prediction');
  };
  
  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Smartphone Price Analysis</CardTitle>
          <CardDescription>
            Upload smartphone data, train ML models, and predict optimal prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-3 w-full md:w-2/3 mx-auto">
              <TabsTrigger value="data-upload" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Data Upload</span>
              </TabsTrigger>
              <TabsTrigger 
                value="model-training" 
                className="flex items-center space-x-2"
                disabled={!dataset}
              >
                <LineChart className="h-4 w-4" />
                <span>Model Training</span>
              </TabsTrigger>
              <TabsTrigger 
                value="price-prediction" 
                className="flex items-center space-x-2"
                disabled={!trainedModel}
              >
                <Smartphone className="h-4 w-4" />
                <span>Price Prediction</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="data-upload" className="space-y-4">
              <DatasetUploader onDatasetProcessed={handleDatasetProcessed} />
            </TabsContent>
            
            <TabsContent value="model-training" className="space-y-4">
              <MLModelTrainer dataset={dataset} onModelTrained={handleModelTrained} />
            </TabsContent>
            
            <TabsContent value="price-prediction" className="space-y-4">
              <SmartphonePricePredictor model={trainedModel} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {dataset && (
        <Card>
          <CardHeader>
            <CardTitle>Dataset Preview</CardTitle>
            <CardDescription>First 5 records from your uploaded dataset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    {dataset[0] && Object.keys(dataset[0]).slice(0, 6).map((header, index) => (
                      <th key={index} className="px-4 py-2 text-left font-medium">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataset.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {Object.entries(row).slice(0, 6).map(([key, value], colIndex) => (
                        <td key={colIndex} className="px-4 py-2">{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartphoneDataTab;
