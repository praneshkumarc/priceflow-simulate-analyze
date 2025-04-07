
import { PhoneCondition } from '@/types/resell';

// Constants for depreciation calculations
const YEARLY_DEPRECIATION_RATE = 0.2; // 20% per year
const INFLATION_RATE = 0.03; // 3% per year
const DEMAND_HIGH_ADJUSTMENT = 0.1; // 10% increase
const DEMAND_LOW_ADJUSTMENT = -0.2; // 20% reduction

const CONDITION_DEPRECIATION_RATES: Record<PhoneCondition, number> = {
  'Excellent': 0,
  'Good': 0.1, // 10% reduction
  'Fair': 0.25, // 25% reduction
  'Poor': 0.4, // 40% reduction
};

export const calculateResellPrice = (
  basePrice: number,
  purchaseYear: number,
  condition: PhoneCondition,
  demand: 'high' | 'medium' | 'low' = 'medium',
  customDescription?: string
): number => {
  const currentYear = new Date().getFullYear();
  const yearsSincePurchase = currentYear - purchaseYear;
  
  // Base depreciation calculation (20% per year)
  let depreciation = Math.min(0.9, yearsSincePurchase * YEARLY_DEPRECIATION_RATE); // Cap at 90% depreciation
  let resellPrice = basePrice * (1 - depreciation);
  
  // Adjust for phone condition
  const conditionRate = CONDITION_DEPRECIATION_RATES[condition] || 0;
  resellPrice = resellPrice * (1 - conditionRate);
  
  // Adjust for demand
  if (demand === 'high') {
    resellPrice = resellPrice * (1 + DEMAND_HIGH_ADJUSTMENT);
  } else if (demand === 'low') {
    resellPrice = resellPrice * (1 + DEMAND_LOW_ADJUSTMENT);
  }
  
  // Adjust for inflation (3% per year)
  const inflationFactor = Math.pow(1 + INFLATION_RATE, yearsSincePurchase);
  resellPrice = resellPrice * inflationFactor;
  
  // For custom descriptions, we could analyze text to determine additional depreciation
  // Simplified approach - if there's a custom description, apply small additional discount
  if (customDescription && customDescription.trim().length > 0) {
    // Further analysis could be done here with NLP in a real implementation
    resellPrice = resellPrice * 0.95; // 5% additional reduction for reported issues
  }
  
  return parseFloat(resellPrice.toFixed(2));
};

export const evaluateResellPrice = (
  calculatedPrice: number, 
  desiredPrice: number
): { 
  decision: 'accept' | 'counter' | 'reject', 
  message: string,
  priceDifference: number,
  percentageDiff: number
} => {
  const priceDifference = desiredPrice - calculatedPrice;
  const percentageDiff = (priceDifference / calculatedPrice) * 100;
  
  // Define acceptable range (±10%)
  if (Math.abs(percentageDiff) <= 10) {
    return {
      decision: 'accept',
      message: "Your price is within our acceptable range. We'll proceed with your request.",
      priceDifference,
      percentageDiff
    };
  } else if (percentageDiff > 10 && percentageDiff <= 25) {
    return {
      decision: 'counter',
      message: `Your price is ${percentageDiff.toFixed(1)}% higher than our calculated fair value. We can offer $${calculatedPrice.toFixed(2)}.`,
      priceDifference,
      percentageDiff
    };
  } else if (percentageDiff < -10 && percentageDiff >= -25) {
    return {
      decision: 'counter',
      message: `Your price is ${Math.abs(percentageDiff).toFixed(1)}% lower than our calculated fair value. We can offer $${calculatedPrice.toFixed(2)}.`,
      priceDifference,
      percentageDiff
    };
  } else if (percentageDiff > 25) {
    return {
      decision: 'reject',
      message: `Your price is ${percentageDiff.toFixed(1)}% higher than our calculated fair value, which is too high for us to accept.`,
      priceDifference,
      percentageDiff
    };
  } else {
    return {
      decision: 'reject',
      message: `Your price is ${Math.abs(percentageDiff).toFixed(1)}% lower than our calculated fair value, which suggests a quality issue we cannot accept.`,
      priceDifference,
      percentageDiff
    };
  }
};
