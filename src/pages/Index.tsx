
import React, { useState } from 'react';
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
import { useIsMobile } from '@/hooks/use-mobile';
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
  id: string;
  label: string;
  href: string;
  Icon: React.FC<any>;
  Component: React.FC;
};

const tabs: TabType[] = [
  { id: 'dashboard', label: 'Dashboard', href: '#dashboard', Icon: BarChart4, Component: Dashboard },
  { id: 'products', label: 'Products', href: '#products', Icon: ShoppingCart, Component: ProductsTab },
  { id: 'price-prediction', label: 'Price Prediction', href: '#price-prediction', Icon: LineChart, Component: PricePredictionTab },
  { id: 'sales-analysis', label: 'Sales Analysis', href: '#sales-analysis', Icon: BarChart4, Component: SalesAnalysisTab },
  { id: 'data-collection', label: 'Data Collection', href: '#data-collection', Icon: Database, Component: DataCollectionTab },
  { id: 'discount-simulation', label: 'Discount Simulation', href: '#discount-simulation', Icon: Tag, Component: DiscountSimulationTab },
  { id: 'smartphone-data', label: 'Smartphone Data', href: '#smartphone-data', Icon: Smartphone, Component: SmartphoneDataTab },
  { id: 'resell', label: 'Resell', href: '#resell', Icon: RotateCcw, Component: ResellTab },
];

const Index = () => {
  const isMobile = useIsMobile();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Find the current tab based on the selected ID
  const currentTabIndex = tabs.findIndex(tab => tab.id === selectedTab);
  const currentTab = tabs[currentTabIndex >= 0 ? currentTabIndex : 0];

  const handleItemClick = (id: string) => {
    setSelectedTab(id);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      {!isMobile && (
        <div className="hidden md:flex md:flex-col">
          <Sidebar 
            navItems={tabs.map(tab => ({ id: tab.id, label: tab.label, href: tab.href }))} 
            selectedItem={selectedTab} 
            handleItemClick={handleItemClick} 
          />
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
          navItems={tabs.map(tab => ({ id: tab.id, label: tab.label, href: tab.href }))}
          selectedItem={selectedTab}
          handleItemClick={handleItemClick}
          setIsOpen={setSidebarOpen}
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
              <span className="font-medium text-gray-900">{currentTab.label}</span>
            </div>

            {/* User Profile */}
            <UserProfile />
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold mb-6">{currentTab.label}</h1>

          {/* Tab Content */}
          <div className="pb-12">
            {tabs.map((tab) => (
              <div key={tab.id} className={tab.id === selectedTab ? 'block' : 'hidden'}>
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
