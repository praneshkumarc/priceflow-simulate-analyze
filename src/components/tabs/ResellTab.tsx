
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ResellForm from '@/components/ResellForm';
import ResellResult from '@/components/ResellResult';
import { ResellCalculation, ResellSubmission } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { dataService } from '@/services/dataService';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const ResellTab: React.FC = () => {
  const [calculation, setCalculation] = useState<ResellCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();
  
  const calculateResellValue = (submission: ResellSubmission): ResellCalculation | null => {
    // Get the dataset to validate the phone model
    const dataset = dataService.getDataset();
    
    // Check if the phone model exists in the dataset
    const modelData = dataset.filter(
      item => `${item.Brand} ${item.Model}`.toLowerCase() === submission.phoneModel.toLowerCase()
    );
    
    if (modelData.length === 0) {
      toast({
        title: "Model Not Found",
        description: "Phone model not supported. Please check again.",
        variant: "destructive",
      });
      return null;
    }
    
    // Get the base price from the dataset
    const phoneData = modelData[0];
    const basePrice = typeof phoneData.Price === 'string' 
      ? parseFloat(phoneData.Price) 
      : phoneData.Price;
      
    // Calculate years since purchase
    const currentYear = new Date().getFullYear();
    const yearsSincePurchase = currentYear - submission.purchaseYear;
    
    // Calculate year depreciation (20% per year)
    const yearDepreciation = Math.min(0.8, yearsSincePurchase * 0.2) * basePrice;
    
    // Get demand level from the dataset or default to neutral
    const demandLevel = phoneData["Demand Level"] || 0.5;
    
    // Calculate demand adjustment (-20% to +10%)
    const demandAdjustment = demandLevel > 0.7 
      ? basePrice * 0.1 // High demand: +10%
      : demandLevel < 0.3 
        ? -basePrice * 0.2 // Low demand: -20%
        : 0; // Neutral demand: 0%
    
    // Calculate condition depreciation
    let conditionDepreciation = 0;
    switch (submission.condition) {
      case 'Excellent':
        conditionDepreciation = 0;
        break;
      case 'Good':
        conditionDepreciation = basePrice * 0.1;
        break;
      case 'Fair':
        conditionDepreciation = basePrice * 0.25;
        break;
      case 'Poor':
        conditionDepreciation = basePrice * 0.4;
        break;
      case 'Custom':
        // Simple NLP simulation - count negative words to determine severity
        const description = submission.customConditionDescription?.toLowerCase() || '';
        const negativeWords = [
          'broken', 'crack', 'scratch', 'damage', 'shatter', 'dent', 'malfunction',
          'problem', 'issue', 'not working', 'faulty', 'defect', 'bad', 'poor'
        ];
        
        let negativeCount = 0;
        negativeWords.forEach(word => {
          if (description.includes(word)) negativeCount++;
        });
        
        // Scale from 10% to 50% based on negative word count
        const severity = Math.min(0.5, 0.1 + (negativeCount * 0.08));
        conditionDepreciation = basePrice * severity;
        break;
    }
    
    // Calculate inflation adjustment (3% per year)
    const inflationAdjustment = basePrice * (Math.pow(1.03, yearsSincePurchase) - 1);
    
    // Calculate the final fair resale price
    const calculatedPrice = Math.max(
      0, 
      basePrice - yearDepreciation + demandAdjustment - conditionDepreciation + inflationAdjustment
    );
    
    // Round to 2 decimal places
    const roundedCalculatedPrice = Math.round(calculatedPrice * 100) / 100;
    
    // Compare with customer's desired price
    const percentageDifference = ((submission.desiredPrice - roundedCalculatedPrice) / roundedCalculatedPrice) * 100;
    const withinRange = Math.abs(percentageDifference) <= 10;
    
    let decision: 'Approved' | 'Counteroffer' | 'Rejected';
    let message: string;
    
    if (withinRange) {
      decision = 'Approved';
      message = "Your phone is approved for resale at your requested price!";
    } else if (percentageDifference > 10) {
      decision = 'Counteroffer';
      message = `Your price is ${Math.round(percentageDifference)}% higher than our fair market value. We can offer ${roundedCalculatedPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}.`;
    } else {
      decision = 'Counteroffer';
      message = `Your price is ${Math.round(Math.abs(percentageDifference))}% lower than our fair market value. We suggest ${roundedCalculatedPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}.`;
    }
    
    return {
      basePrice,
      yearDepreciation,
      demandAdjustment,
      conditionDepreciation,
      inflationAdjustment,
      calculatedPrice: roundedCalculatedPrice,
      withinRange,
      percentageDifference,
      customerPrice: submission.desiredPrice,
      decision,
      message
    };
  };
  
  const handleSubmit = (submission: ResellSubmission) => {
    setIsCalculating(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      const result = calculateResellValue(submission);
      if (result) {
        setCalculation(result);
        toast({
          title: "Calculation Complete",
          description: "We've calculated a fair resale value for your phone.",
        });
      }
      setIsCalculating(false);
    }, 1500);
  };
  
  const handleReset = () => {
    setCalculation(null);
    setIsCompleted(false);
  };

  const handleAcceptOffer = (calculation: ResellCalculation) => {
    // Here you would normally send this data to a backend
    // For now, we'll just mark the transaction as completed
    setIsCompleted(true);
    toast({
      title: "Offer Accepted",
      description: "Your transaction has been processed successfully. We'll be in touch soon with next steps.",
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Phone Resell Service</CardTitle>
          <CardDescription>
            Submit your used phone for resale and get an instant price offer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Transaction Complete!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for using our resell service. We'll process your device and be in touch shortly.
              </p>
              <Button onClick={handleReset}>Sell Another Device</Button>
            </div>
          ) : calculation ? (
            <ResellResult 
              calculation={calculation} 
              onReset={handleReset}
              onAcceptOffer={handleAcceptOffer}
            />
          ) : (
            <ResellForm 
              onSubmit={handleSubmit} 
              isCalculating={isCalculating} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResellTab;
