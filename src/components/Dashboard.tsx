
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { dataService } from '@/services/dataService';
import { TooltipProvider } from "@/components/ui/tooltip";
import DataCollectionTab from './tabs/DataCollectionTab';
import SalesAnalysisTab from './tabs/SalesAnalysisTab';
import PricePredictionTab from './tabs/PricePredictionTab';
import DiscountSimulationTab from './tabs/DiscountSimulationTab';
import SmartphoneDataTab from './tabs/SmartphoneDataTab';
import { Database, BarChart, LineChart, Percent, Smartphone } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('data-collection');
  
  return (
    <TooltipProvider>
      <div className="flex flex-col w-full h-full min-h-screen bg-gray-50">
        <header className="border-b bg-white shadow-sm">
          <div className="container py-4 px-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-app-blue-600">PriceFlow</h1>
              <p className="text-sm text-gray-500">Dynamic Pricing Simulator</p>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-6 py-8 flex-1">
          <Tabs
            defaultValue="data-collection"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="data-collection" className="px-4 md:px-6 flex items-center gap-1">
                  <Database className="h-4 w-4 hidden md:inline" />
                  Data Collection
                </TabsTrigger>
                <TabsTrigger value="sales-analysis" className="px-4 md:px-6 flex items-center gap-1">
                  <BarChart className="h-4 w-4 hidden md:inline" />
                  Sales Analysis
                </TabsTrigger>
                <TabsTrigger value="price-prediction" className="px-4 md:px-6 flex items-center gap-1">
                  <LineChart className="h-4 w-4 hidden md:inline" />
                  Price Prediction
                </TabsTrigger>
                <TabsTrigger value="discount-simulation" className="px-4 md:px-6 flex items-center gap-1">
                  <Percent className="h-4 w-4 hidden md:inline" />
                  Discount Simulation
                </TabsTrigger>
                <TabsTrigger value="smartphone-data" className="px-4 md:px-6 flex items-center gap-1">
                  <Smartphone className="h-4 w-4 hidden md:inline" />
                  Smartphone ML
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="data-collection" className="space-y-6">
              <DataCollectionTab />
            </TabsContent>
            
            <TabsContent value="sales-analysis" className="space-y-6">
              <SalesAnalysisTab />
            </TabsContent>
            
            <TabsContent value="price-prediction" className="space-y-6">
              <PricePredictionTab />
            </TabsContent>
            
            <TabsContent value="discount-simulation" className="space-y-6">
              <DiscountSimulationTab />
            </TabsContent>
            
            <TabsContent value="smartphone-data" className="space-y-6">
              <SmartphoneDataTab />
            </TabsContent>
          </Tabs>
        </main>
        
        <footer className="bg-white border-t py-4 px-6">
          <div className="container mx-auto text-center text-sm text-gray-500">
            PriceFlow Simulator © {new Date().getFullYear()} | AI-Driven Dynamic Price Prediction
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
};

export default Dashboard;
