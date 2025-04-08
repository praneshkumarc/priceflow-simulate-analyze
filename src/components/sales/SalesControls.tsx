
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface SalesControlsProps {
  onProductSelect: (productId: string) => void;
  selectedProductId: string;
  timeframe: 'all' | '30d' | '90d' | '180d';
  onTimeframeChange: (value: 'all' | '30d' | '90d' | '180d') => void;
  loading: boolean;
}

const SalesControls: React.FC<SalesControlsProps> = ({
  onProductSelect,
  selectedProductId,
  timeframe,
  onTimeframeChange,
  loading
}) => {
  // Hardcoded iPhone options as specified
  const iPhoneOptions = [
    { id: 'all', name: 'All Products' },
    { id: 'iphone15promax', name: 'Apple iPhone 15 Pro Max' },
    { id: 'iphone15pro', name: 'Apple iPhone 15 Pro' },
    { id: 'iphone14promax', name: 'Apple iPhone 14 Pro Max' },
    { id: 'iphone14pro', name: 'Apple iPhone 14 Pro' },
    { id: 'iphone11', name: 'Apple iPhone 11' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <div className="w-full md:w-1/3">
        {loading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <div className="space-y-2">
            <Label htmlFor="product-select">Select Product</Label>
            <Select
              value={selectedProductId}
              onValueChange={onProductSelect}
            >
              <SelectTrigger className="w-full" id="product-select">
                <SelectValue placeholder="Select a product to analyze" />
              </SelectTrigger>
              <SelectContent>
                {iPhoneOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div>
        <Tabs
          defaultValue={timeframe}
          value={timeframe}
          onValueChange={(value) => onTimeframeChange(value as 'all' | '30d' | '90d' | '180d')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="all" className="text-xs md:text-sm">
              All Time
            </TabsTrigger>
            <TabsTrigger value="180d" className="text-xs md:text-sm">
              180 Days
            </TabsTrigger>
            <TabsTrigger value="90d" className="text-xs md:text-sm">
              90 Days
            </TabsTrigger>
            <TabsTrigger value="30d" className="text-xs md:text-sm">
              30 Days
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default SalesControls;
