
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryData {
  name: string;
  value: number;
  units: number;
}

interface SalesByCategoryChartProps {
  salesByCategory: CategoryData[];
  loading: boolean;
}

// Updated colors for the three segments: Premium, Mid Range, Budget
const COLORS = ['#3aa4ff', '#4ac0c0', '#ffbb28'];

const SalesByCategoryChart: React.FC<SalesByCategoryChartProps> = ({
  salesByCategory,
  loading
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
        <CardDescription>Revenue distribution across product categories</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px]">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={isMobile ? 70 : 80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  animationDuration={500}
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-lg">
                          <p className="font-medium">{payload[0].name}</p>
                          <p>Revenue: {formatCurrency(payload[0].value as number)}</p>
                          <p>Units: {formatNumber(payload[0].payload.units)}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {(payload[0].payload.value / salesByCategory.reduce((sum, cat) => sum + cat.value, 0) * 100).toFixed(1)}% of total revenue
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Category Distribution</div>
          <div className="space-y-1">
            {salesByCategory.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 mr-2 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{category.name}</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(category.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesByCategoryChart;
