
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ResellTab from '@/components/tabs/ResellTab';
import { dataService } from '@/services/dataService';
import { ToastProvider } from '@/components/ui/toast';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the dataService
vi.mock('@/services/dataService', () => ({
  dataService: {
    getDataset: vi.fn(() => [
      {
        Brand: 'Apple',
        Model: 'iPhone 12',
        Price: 799,
        'Demand Level': 0.8,
      },
      {
        Brand: 'Samsung',
        Model: 'Galaxy S21',
        Price: 699,
        'Demand Level': 0.6,
      },
    ]),
  },
}));

describe('ResellTab', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock global setTimeout
    vi.useFakeTimers();
  });

  it('renders the resell form initially', () => {
    render(
      <ToastProvider>
        <ResellTab />
      </ToastProvider>
    );
    
    expect(screen.getByText('Phone Resell Service')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Model')).toBeInTheDocument();
    expect(screen.getByLabelText('Year of Purchase')).toBeInTheDocument();
    expect(screen.getByLabelText('Condition')).toBeInTheDocument();
    expect(screen.getByLabelText('Desired Price ($)')).toBeInTheDocument();
  });

  it('shows a loading state when calculating', async () => {
    render(
      <ToastProvider>
        <ResellTab />
      </ToastProvider>
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Phone Model'), { target: { value: 'Apple iPhone 12' } });
    fireEvent.change(screen.getByLabelText('Year of Purchase'), { target: { value: '2020' } });
    fireEvent.change(screen.getByLabelText('Condition'), { target: { value: 'Good' } });
    fireEvent.change(screen.getByLabelText('Desired Price ($)'), { target: { value: '500' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Get Resell Value'));
    
    // Check for loading state
    expect(screen.getByText('Calculating...')).toBeInTheDocument();
    
    // Fast-forward timers
    vi.runAllTimers();
    
    // Ensure the calculation is displayed
    await waitFor(() => {
      expect(screen.queryByText('Calculating...')).not.toBeInTheDocument();
    });
  });

  it('shows the calculation result when form is submitted', async () => {
    render(
      <ToastProvider>
        <ResellTab />
      </ToastProvider>
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Phone Model'), { target: { value: 'Apple iPhone 12' } });
    fireEvent.change(screen.getByLabelText('Year of Purchase'), { target: { value: '2020' } });
    fireEvent.change(screen.getByLabelText('Condition'), { target: { value: 'Good' } });
    fireEvent.change(screen.getByLabelText('Desired Price ($)'), { target: { value: '500' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Get Resell Value'));
    
    // Fast-forward timers
    vi.runAllTimers();
    
    // Ensure the calculation results appear
    await waitFor(() => {
      expect(screen.getByText('Price Calculation Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Base Market Price:')).toBeInTheDocument();
      expect(screen.getByText('Year Depreciation:')).toBeInTheDocument();
    });
  });
});
