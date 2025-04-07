
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ResellResult from '@/components/ResellResult';
import { ResellCalculation } from '@/types';
import { ToastProvider } from '@/components/ui/toast';
import '@testing-library/jest-dom';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('ResellResult', () => {
  const mockCalculation: ResellCalculation = {
    basePrice: 799,
    yearDepreciation: 159.8,
    demandAdjustment: 79.9,
    conditionDepreciation: 79.9,
    inflationAdjustment: 23.97,
    calculatedPrice: 663.17,
    withinRange: false,
    percentageDifference: -24.6,
    customerPrice: 500,
    decision: 'Counteroffer',
    message: 'Your price is 25% lower than our fair market value. We suggest $663.17.',
  };

  const mockResetHandler = vi.fn();
  const mockAcceptOfferHandler = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders the calculation results correctly', () => {
    render(
      <ToastProvider>
        <ResellResult 
          calculation={mockCalculation} 
          onReset={mockResetHandler} 
          onAcceptOffer={mockAcceptOfferHandler} 
        />
      </ToastProvider>
    );
    
    // Check for basic elements
    expect(screen.getByText('Counteroffer')).toBeInTheDocument();
    expect(screen.getByText(mockCalculation.message)).toBeInTheDocument();
    
    // Check price displays
    expect(screen.getByText('$500.00')).toBeInTheDocument(); // Customer price
    expect(screen.getByText('$663.17')).toBeInTheDocument(); // Calculated price
    
    // Check calculation breakdown
    expect(screen.getByText('Base Market Price:')).toBeInTheDocument();
    expect(screen.getByText('Year Depreciation:')).toBeInTheDocument();
    expect(screen.getByText('Demand Adjustment:')).toBeInTheDocument();
    expect(screen.getByText('Condition Depreciation:')).toBeInTheDocument();
    expect(screen.getByText('Inflation Adjustment:')).toBeInTheDocument();
  });

  it('calls onReset when "Try Again" button is clicked', () => {
    render(
      <ToastProvider>
        <ResellResult 
          calculation={mockCalculation} 
          onReset={mockResetHandler} 
          onAcceptOffer={mockAcceptOfferHandler} 
        />
      </ToastProvider>
    );
    
    fireEvent.click(screen.getByText('Try Again'));
    expect(mockResetHandler).toHaveBeenCalledTimes(1);
  });

  it('calls onAcceptOffer when "Accept Counteroffer" button is clicked', () => {
    render(
      <ToastProvider>
        <ResellResult 
          calculation={mockCalculation} 
          onReset={mockResetHandler} 
          onAcceptOffer={mockAcceptOfferHandler} 
        />
      </ToastProvider>
    );
    
    fireEvent.click(screen.getByText('Accept Counteroffer'));
    expect(mockAcceptOfferHandler).toHaveBeenCalledTimes(1);
    expect(mockAcceptOfferHandler).toHaveBeenCalledWith(mockCalculation);
  });
});
