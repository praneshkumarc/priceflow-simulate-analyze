
import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { ChevronRight, MenuIcon } from 'lucide-react';
import Dashboard from '@/components/Dashboard';
import Sidebar from '@/components/ui/sidebar';
import MobileNav from '@/components/ui/MobileNav';
import ProductsTab from '@/components/tabs/ProductsTab';
import DataCollectionTab from '@/components/tabs/DataCollectionTab';
import PricePredictionTab from '@/components/tabs/PricePredictionTab';
import SalesAnalysisTab from '@/components/tabs/SalesAnalysisTab';
import DiscountSimulationTab from '@/components/tabs/DiscountSimulationTab';
import SmartphoneDataTab from '@/components/tabs/SmartphoneDataTab';
import ResellTab from '@/components/tabs/ResellTab';
import { useMobile } from '@/hooks/use-mobile';
import UserProfile from '@/components/UserProfile';

// Add icons to sidebar
import {
  Smartphone,
  LineChart,
  BarChart4,
  Database,
  Tag,
  ShoppingCart,
  RotateCcw
} from 'lucide-react';

export type TabType = {
  name: string;
  Icon: React.FC<any>;
  Component: React.FC;
};

const tabs: TabType[] = [
  { name: 'Dashboard', Icon: BarChart4, Component: Dashboard },
  { name: 'Products', Icon: ShoppingCart, Component: ProductsTab },
  { name: 'Price Prediction', Icon: LineChart, Component: PricePredictionTab },
  { name: 'Sales Analysis', Icon: BarChart4, Component: SalesAnalysisTab },
  { name: 'Data Collection', Icon: Database, Component: DataCollectionTab },
  { name: 'Discount Simulation', Icon: Tag, Component: DiscountSimulationTab },
  { name: 'Smartphone Data', Icon: Smartphone, Component: SmartphoneDataTab },
  { name: 'Resell', Icon: RotateCcw, Component: ResellTab },
];

const Index = () => {
  const { isMobile } = useMobile();
  const [selectedTab, setSelectedTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      {!isMobile && (
        <div className="hidden md:flex md:flex-col">
          <Sidebar tabs={tabs} selectedTab={selectedTab} onTabSelect={setSelectedTab} />
        </div>
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg z-40"
        >
          <MenuIcon size={24} />
        </button>
      )}

      {/* Mobile Navigation */}
      {isMobile && sidebarOpen && (
        <MobileNav
          tabs={tabs}
          selectedTab={selectedTab}
          onTabSelect={(index) => {
            setSelectedTab(index);
            setSidebarOpen(false);
          }}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          {/* Top Navigation */}
          <div className="flex justify-between items-center mb-4">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-600">
              <span>Home</span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="font-medium text-gray-900">{tabs[selectedTab].name}</span>
            </div>

            {/* User Profile */}
            <UserProfile />
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold mb-6">{tabs[selectedTab].name}</h1>

          {/* Tab Content */}
          <div className="pb-12">
            {tabs.map((tab, index) => (
              <div key={index} className={index === selectedTab ? 'block' : 'hidden'}>
                <tab.Component />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
