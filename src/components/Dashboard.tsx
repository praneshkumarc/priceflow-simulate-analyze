import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { BarChart, LineChart, PieChart } from "lucide-react";
import ProductsTab from "./tabs/ProductsTab";
import PricePredictionTab from "./tabs/PricePredictionTab";
import DiscountSimulationTab from "./tabs/DiscountSimulationTab";
import UserAuth from './UserAuth';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">PriceSmart</h2>
            <UserAuth />
          </div>
          <div className="space-y-1">
            <Button
              variant={activeTab === "products" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("products")}
            >
              Products
            </Button>
            <Button
              variant={activeTab === "price-prediction" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("price-prediction")}
            >
              Price Prediction
            </Button>
            <Button
              variant={activeTab === "discount-simulation" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("discount-simulation")}
            >
              Discount Simulation
            </Button>
          </div>
          <div className="mt-auto px-3 py-2">
            <p className="text-xs text-sidebar-foreground/60">
              © 2025 PriceSmart
            </p>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "price-prediction" && <PricePredictionTab />}
        {activeTab === "discount-simulation" && <DiscountSimulationTab />}
      </main>
    </div>
  );
};

export default Dashboard;
