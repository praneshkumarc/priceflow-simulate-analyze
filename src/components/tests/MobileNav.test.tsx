
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MobileNav from '@/components/ui/MobileNav';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

describe('MobileNav', () => {
  const mockNavItems = [
    { id: 'dashboard', label: 'Dashboard', href: '#dashboard' },
    { id: 'products', label: 'Products', href: '#products' },
    { id: 'settings', label: 'Settings', href: '#settings' },
  ];
  
  const mockHandleItemClick = vi.fn();
  const mockSetIsOpen = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('renders navigation items correctly', () => {
    render(
      <BrowserRouter>
        <MobileNav
          navItems={mockNavItems}
          selectedItem="dashboard"
          handleItemClick={mockHandleItemClick}
          setIsOpen={mockSetIsOpen}
        />
      </BrowserRouter>
    );
    
    // Check if all nav items are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('highlights the selected item', () => {
    render(
      <BrowserRouter>
        <MobileNav
          navItems={mockNavItems}
          selectedItem="products"
          handleItemClick={mockHandleItemClick}
          setIsOpen={mockSetIsOpen}
        />
      </BrowserRouter>
    );
    
    // Get all nav links
    const navLinks = screen.getAllByRole('link');
    
    // Find the selected link (Products)
    const selectedLink = navLinks.find(link => link.textContent === 'Products');
    const nonSelectedLink = navLinks.find(link => link.textContent === 'Dashboard');
    
    // Check that the selected link has different styling
    expect(selectedLink?.className).not.toEqual(nonSelectedLink?.className);
  });

  it('calls handleItemClick and setIsOpen when a nav item is clicked', () => {
    render(
      <BrowserRouter>
        <MobileNav
          navItems={mockNavItems}
          selectedItem="dashboard"
          handleItemClick={mockHandleItemClick}
          setIsOpen={mockSetIsOpen}
        />
      </BrowserRouter>
    );
    
    // Click on Products link
    fireEvent.click(screen.getByText('Products'));
    
    // Check if handlers were called with correct arguments
    expect(mockHandleItemClick).toHaveBeenCalledWith('products');
    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });
});
