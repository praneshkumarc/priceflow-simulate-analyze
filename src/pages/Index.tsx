
import React, { useState, useEffect } from 'react';
import { ChevronRight, MenuIcon, X } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const [tabChanged, setTabChanged] = useState(false);

  // Find the current tab based on the selected ID
  const currentTabIndex = tabs.findIndex(tab => tab.id === selectedTab);
  const currentTab = tabs[currentTabIndex >= 0 ? currentTabIndex : 0];

  const handleItemClick = (id: string) => {
    if (id !== selectedTab) {
      setTabChanged(true);
      setSelectedTab(id);
      // Reset animation flag after animation completes
      setTimeout(() => setTabChanged(false), 300);
    }
    // Close sidebar after selecting an item
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    // Close sidebar when window is resized to mobile size
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar - visible only when sidebarOpen is true */}
      {!isMobile && (
        <div className={`md:flex md:flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
          <Sidebar 
            navItems={tabs.map(tab => ({ id: tab.id, label: tab.label, href: tab.href }))} 
            selectedItem={selectedTab} 
            handleItemClick={handleItemClick} 
          />
        </div>
      )}

      {/* Sidebar Toggle Button for Desktop */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className={cn(
            "fixed top-4 left-4 z-40 p-2 rounded-full shadow-md border border-gray-200 transition-all duration-300",
            sidebarOpen ? "bg-white text-primary hover:bg-gray-100" : "bg-primary text-white hover:bg-primary/90"
          )}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <X size={20} /> : <MenuIcon size={20} />}
        </button>
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg z-40 hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95"
        >
          <MenuIcon size={24} />
        </button>
      )}

      {/* Mobile Navigation */}
      {isMobile && sidebarOpen && (
        <div className="animate-fade-in">
          <MobileNav
            navItems={tabs.map(tab => ({ id: tab.id, label: tab.label, href: tab.href }))}
            selectedItem={selectedTab}
            handleItemClick={handleItemClick}
            setIsOpen={setSidebarOpen}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {/* Top Navigation */}
          <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span>Home</span>
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">{currentTab.label}</span>
            </div>

            {/* User Profile */}
            <UserProfile />
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-900 dark:text-white transition-all duration-300">
            {currentTab.label}
          </h1>

          {/* Tab Content */}
          <div className="pb-12">
            {tabs.map((tab) => (
              <div 
                key={tab.id} 
                className={cn(
                  tab.id === selectedTab ? 'block' : 'hidden',
                  tabChanged && tab.id === selectedTab ? 'animate-fade-in' : ''
                )}
              >
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
