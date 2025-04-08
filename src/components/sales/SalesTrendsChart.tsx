
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';
import { SalesTrend } from '@/types';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';
import { ChartContainer } from '@/components/ui/chart';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Skeleton } from '@/components/ui/skeleton';

interface SalesTrendsChartProps {
  salesTrends: SalesTrend[];
  title: string;
  description: string;
  totalRevenue: number;
  totalUnits: number;
  loading: boolean;
}

const SalesTrendsChart: React.FC<SalesTrendsChartProps> = ({
  salesTrends,
  title,
  description,
  totalRevenue,
  totalUnits,
  loading
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px]">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <div className="h-[300px]">
            <ChartContainer
              config={{
                revenue: { color: "#3aa4ff" },
                sales: { color: "#4ac0c0" }
              }}
            >
              <LineChart data={salesTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis 
                  yAxisId="left" 
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => isMobile ? `${value / 1000}k` : formatNumber(value)}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-lg">
                          <p className="font-medium">{formatDate(label as string)}</p>
                          <p className="text-[#3aa4ff]">
                            Revenue: {formatCurrency(payload[0].value as number)}
                          </p>
                          <p className="text-[#4ac0c0]">
                            Units Sold: {formatNumber(payload[1].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3aa4ff" 
                  name="Revenue" 
                  dot={false}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#4ac0c0" 
                  name="Units Sold" 
                  dot={false}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-muted-foreground">Total Units</div>
            <div className="text-2xl font-bold">{formatNumber(totalUnits)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesTrendsChart;
