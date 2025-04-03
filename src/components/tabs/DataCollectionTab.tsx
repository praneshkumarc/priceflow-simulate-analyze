
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dataService } from '@/services/dataService';
import { Product, ProductSale, CompetitorPrice } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MetricCard from '../MetricCard';
import { Database, ShoppingBag, Package, LineChart } from 'lucide-react';

const DataCollectionTab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<ProductSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [topSellers, setTopSellers] = useState<{ product: Product; revenue: number; units: number }[]>([]);
  
  useEffect(() => {
    // Load products and sales data
    const fetchData = () => {
      try {
        const allProducts = dataService.getAllProducts();
        const allSales = dataService.getAllSales();
        const topSellingProducts = dataService.getTopSellingProducts(5);
        
        setProducts(allProducts);
        setSales(allSales);
        setTopSellers(topSellingProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const totalProducts = products.length;
  const totalSales = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
  const uniqueCategories = [...new Set(products.map(p => p.category))].length;
  
  // Prepare data for the top seller chart
  const chartData = topSellers.map(item => ({
    name: item.product.name,
    revenue: item.revenue,
    units: item.units
  }));
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Products"
          value={totalProducts.toString()}
          description="Products in database"
          icon={<Package className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Sales"
          value={totalSales.toString()}
          description="Units sold"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          description="From all sales"
          icon={<LineChart className="h-4 w-4" />}
        />
        <MetricCard
          title="Product Categories"
          value={uniqueCategories.toString()}
          description="Unique categories"
          icon={<Database className="h-4 w-4" />}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>By revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" fill="#3aa4ff" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Database</CardTitle>
            <CardDescription>Recent products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Inventory</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.slice(0, 10).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatCurrency(product.basePrice)}</TableCell>
                      <TableCell>{product.inventory}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales Transactions</CardTitle>
          <CardDescription>Last 10 sales records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.slice(0, 10).map((sale) => {
                const product = products.find(p => p.id === sale.productId);
                return (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDate(sale.date)}</TableCell>
                    <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{formatCurrency(sale.price)}</TableCell>
                    <TableCell>{formatCurrency(sale.price * sale.quantity)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataCollectionTab;
