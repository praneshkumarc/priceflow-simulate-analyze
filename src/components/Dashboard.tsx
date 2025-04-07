
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from "@/components/ui/tooltip";
import DataCollectionTab from './tabs/DataCollectionTab';
import SalesAnalysisTab from './tabs/SalesAnalysisTab';
import PricePredictionTab from './tabs/PricePredictionTab';
import DiscountSimulationTab from './tabs/DiscountSimulationTab';
import ProductsTab from './tabs/ProductsTab';
import ResellTab from './tabs/ResellTab';
import { Database, BarChart, LineChart, Percent, Package, UserRound, LogOut, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('products');
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'G';
    
    const email = user.email || '';
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };
  
  return (
    <TooltipProvider>
      <div className="flex flex-col w-full h-full min-h-screen bg-gray-50">
        <header className="border-b bg-white shadow-sm">
          <div className="container py-4 px-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-app-blue-600">PriceFlow</h1>
              <p className="text-sm text-gray-500">Dynamic Pricing Simulator</p>
            </div>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <UserRound className="mr-2 h-4 w-4" />
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={() => window.location.href = "/auth"}>
                Sign In
              </Button>
            )}
          </div>
        </header>
        
        <main className="container mx-auto px-6 py-8 flex-1">
          <Tabs
            defaultValue="products"
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
                <TabsTrigger value="products" className="px-4 md:px-6 flex items-center gap-1">
                  <Package className="h-4 w-4 hidden md:inline" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="price-prediction" className="px-4 md:px-6 flex items-center gap-1">
                  <LineChart className="h-4 w-4 hidden md:inline" />
                  Price Prediction
                </TabsTrigger>
                <TabsTrigger value="discount-simulation" className="px-4 md:px-6 flex items-center gap-1">
                  <Percent className="h-4 w-4 hidden md:inline" />
                  Discount Simulation
                </TabsTrigger>
                <TabsTrigger value="resell" className="px-4 md:px-6 flex items-center gap-1">
                  <RefreshCcw className="h-4 w-4 hidden md:inline" />
                  Resell
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="data-collection" className="space-y-6">
              <DataCollectionTab />
            </TabsContent>
            
            <TabsContent value="sales-analysis" className="space-y-6">
              <SalesAnalysisTab />
            </TabsContent>
            
            <TabsContent value="products" className="space-y-6">
              <ProductsTab />
            </TabsContent>
            
            <TabsContent value="price-prediction" className="space-y-6">
              <PricePredictionTab />
            </TabsContent>
            
            <TabsContent value="discount-simulation" className="space-y-6">
              <DiscountSimulationTab />
            </TabsContent>
            
            <TabsContent value="resell" className="space-y-6">
              <ResellTab />
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
