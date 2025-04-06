
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PriceElasticityChartProps {
  data: Array<{price: number, demand: number}>;
  title?: string;
}

const PriceElasticityChart: React.FC<PriceElasticityChartProps> = ({ 
  data, 
  title = "Price Elasticity Curve" 
}) => {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="price" 
                label={{ value: 'Price ($)', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis 
                label={{ value: 'Demand (Units)', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="demand" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Expected Demand"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceElasticityChart;
