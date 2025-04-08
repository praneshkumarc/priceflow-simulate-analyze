
import React from 'react';
import SalesControls from '@/components/sales/SalesControls';
import SalesTrendsChart from '@/components/sales/SalesTrendsChart';
import SalesByCategoryChart from '@/components/sales/SalesByCategoryChart';
import { useSalesAnalysis } from '@/hooks/use-sales-analysis';

const SalesAnalysisTab: React.FC = () => {
  const {
    selectedProductId,
    salesTrends,
    timeframe,
    salesByCategory,
    loading,
    totalRevenue,
    totalUnits,
    handleProductChange,
    setTimeframe,
    getSelectedProductName,
    getTimeframeLabel
  } = useSalesAnalysis();

  return (
    <div className="space-y-6">
      <SalesControls
        onProductSelect={handleProductChange}
        selectedProductId={selectedProductId}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        loading={loading}
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <SalesTrendsChart
          salesTrends={salesTrends}
          title="Sales Trends"
          description={`${getSelectedProductName()} - ${getTimeframeLabel()}`}
          totalRevenue={totalRevenue}
          totalUnits={totalUnits}
          loading={loading}
        />
        
        <SalesByCategoryChart
          salesByCategory={salesByCategory}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default SalesAnalysisTab;
