
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfitProjectionChartProps {
  data: Array<{price: number, revenue: number, profit: number}>;
  title?: string;
}

const ProfitProjectionChart: React.FC<ProfitProjectionChartProps> = ({ 
  data, 
  title = "Profit Projection" 
}) => {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="price" 
                label={{ value: 'Price ($)', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis 
                label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stackId="1" 
                stroke="#8884d8" 
                fill="#8884d8" 
                name="Revenue"
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stackId="2" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitProjectionChart;
