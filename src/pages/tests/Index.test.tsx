import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Index from '@/pages/Index';
import { BrowserRouter } from 'react-router-dom';

// Mock components
vi.mock('@/components/Dashboard', () => ({
  default: () => <div data-testid="dashboard-component">Dashboard Content</div>
}));

vi.mock('@/components/tabs/ProductsTab', () => ({
  default: () => <div data-testid="products-component">Products Content</div>
}));

vi.mock('@/components/UserProfile', () => ({
  default: () => <div data-testid="user-profile">User Profile</div>
}));

// Mock other tab components
vi.mock('@/components/tabs/DataCollectionTab', () => ({
  default: () => <div data-testid="data-collection-component">Data Collection Content</div>
}));

vi.mock('@/components/tabs/PricePredictionTab', () => ({
  default: () => <div data-testid="price-prediction-component">Price Prediction Content</div>
}));

vi.mock('@/components/tabs/SalesAnalysisTab', () => ({
  default: () => <div data-testid="sales-analysis-component">Sales Analysis Content</div>
}));

vi.mock('@/components/tabs/DiscountSimulationTab', () => ({
  default: () => <div data-testid="discount-simulation-component">Discount Simulation Content</div>
}));

vi.mock('@/components/tabs/SmartphoneDataTab', () => ({
  default: () => <div data-testid="smartphone-data-component">Smartphone Data Content</div>
}));

vi.mock('@/components/tabs/ResellTab', () => ({
  default: () => <div data-testid="resell-component">Resell Content</div>
}));

// Mock the useIsMobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false
}));

describe('Index component', () => {
  beforeEach(() => {
    // Clear mocks between tests
    vi.clearAllMocks();
  });

  it('renders the dashboard tab by default', () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );
    
    // Dashboard should be visible by default
    expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
    
    // Other components should be hidden
    expect(screen.queryByTestId('products-component')).toHaveAttribute('class', expect.stringContaining('hidden'));
  });

  it('changes the active tab when sidebar item is clicked', () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );
    
    // First, we need to open the sidebar
    const sidebarToggle = screen.getByLabelText('Open sidebar');
    fireEvent.click(sidebarToggle);
    
    // Find and click the Products tab
    const productsTabLink = screen.getByText('Products');
    fireEvent.click(productsTabLink);
    
    // Now Products component should be visible and Dashboard hidden
    expect(screen.getByTestId('products-component')).toHaveAttribute('class', expect.not.stringContaining('hidden'));
    expect(screen.getByTestId('dashboard-component')).toHaveAttribute('class', expect.stringContaining('hidden'));
    
    // Check that the header title updated
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('toggles the sidebar visibility when sidebar toggle button is clicked', () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );
    
    // Sidebar should be hidden initially
    const sidebar = screen.getByRole('navigation').parentElement;
    expect(sidebar).toHaveClass('w-0');
    
    // Click to open sidebar
    const sidebarToggle = screen.getByLabelText('Open sidebar');
    fireEvent.click(sidebarToggle);
    
    // Sidebar should now be visible
    expect(sidebar).toHaveClass('w-64');
    
    // Click to close sidebar
    const closeButton = screen.getByLabelText('Close sidebar');
    fireEvent.click(closeButton);
    
    // Sidebar should be hidden again
    expect(sidebar).toHaveClass('w-0');
  });

  it('displays the correct breadcrumb path for the selected tab', () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );
    
    // Open sidebar and click on Sales Analysis tab
    const sidebarToggle = screen.getByLabelText('Open sidebar');
    fireEvent.click(sidebarToggle);
    
    const salesAnalysisLink = screen.getByText('Sales Analysis');
    fireEvent.click(salesAnalysisLink);
    
    // Check breadcrumb shows correct path
    const breadcrumbItems = screen.getAllByText(/Home|Sales Analysis/);
    expect(breadcrumbItems[0].textContent).toBe('Home');
    expect(breadcrumbItems[1].textContent).toBe('Sales Analysis');
  });

  it('renders the user profile component', () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
  });
});
