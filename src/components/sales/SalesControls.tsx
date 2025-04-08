
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductSelect from '@/components/ProductSelect';
import { Product } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface SalesControlsProps {
  products: Product[];
  onProductSelect: (productId: string) => void;
  selectedProductId: string;
  timeframe: 'all' | '30d' | '90d' | '180d';
  onTimeframeChange: (value: 'all' | '30d' | '90d' | '180d') => void;
  loading: boolean;
}

const SalesControls: React.FC<SalesControlsProps> = ({
  products,
  onProductSelect,
  selectedProductId,
  timeframe,
  onTimeframeChange,
  loading
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <div className="w-full md:w-1/3">
        {loading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <ProductSelect
            products={products}
            onProductSelect={onProductSelect}
            selectedProductId={selectedProductId}
            placeholder="Select a product to analyze"
            showPrices={false}
          />
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
