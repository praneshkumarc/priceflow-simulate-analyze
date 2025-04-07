
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ResellForm from '@/components/ResellForm';
import ResellResult from '@/components/ResellResult';
import { ResellCalculation, ResellSubmission } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { dataService } from '@/services/dataService';
import { supabase, fromTable } from '@/integrations/supabase/client';

const ResellTab: React.FC = () => {
  const [calculation, setCalculation] = useState<ResellCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Save dataset to Supabase if not already done
  useEffect(() => {
    const saveDatasetToSupabase = async () => {
      const dataset = dataService.getDataset();
      
      // Check if we have data already in the smartphone_data table
      const { data: existingData, error: fetchError } = await fromTable('smartphone_data')
        .select('id')
        .limit(1);
        
      if (fetchError) {
        console.error('Error checking for existing data:', fetchError);
        return;
      }
      
      // If we already have data, don't insert again
      if (existingData && existingData.length > 0) {
        return;
      }
      
      // Insert dataset into Supabase
      for (const item of dataset) {
        try {
          const userId = (await supabase.auth.getUser()).data.user?.id;
          if (!userId) {
            console.error('User is not authenticated');
            return;
          }
          
          const { error } = await fromTable('smartphone_data')
            .insert({
              brand: item.Brand || 'Unknown',
              model: item.Model || 'Unknown',
              market_price: typeof item.Price === 'string' ? parseFloat(item.Price) : item.Price,
              specifications: {
                storage: item.Specifications?.Storage || '',
                ram: item.Specifications?.RAM || '',
                processor: item.Specifications?.['Processor Type'] || '',
                display: item.Specifications?.['Display Hz'] ? `${item.Specifications?.['Display Hz']}Hz` : '',
                camera: item.Specifications?.['Camera MP'] ? `${item.Specifications?.['Camera MP']}MP` : '',
                battery: item.Specifications?.['Battery Capacity'] || '',
                os: item.Specifications?.OS || '',
                color: item.Specifications?.Color || ''
              },
              user_id: userId
            });
            
          if (error) {
            console.error('Error inserting smartphone data:', error);
          }
        } catch (err) {
          console.error('Error in Supabase operation:', err);
        }
      }
    };
    
    saveDatasetToSupabase();
  }, []);
  
  const calculateResellValue = async (submission: ResellSubmission): Promise<ResellCalculation | null> => {
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
    
    // Save to Supabase
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        console.error('User is not authenticated');
        return null;
      }
      
      const { error } = await fromTable('resell_data')
        .insert({
          phone_model: submission.phoneModel,
          condition: submission.condition,
          custom_condition_description: submission.customConditionDescription,
          purchase_year: submission.purchaseYear,
          desired_price: submission.desiredPrice,
          calculated_price: roundedCalculatedPrice,
          status: decision.toLowerCase(),
          user_id: userId
        });
        
      if (error) {
        console.error('Error saving resell data:', error);
      }
    } catch (err) {
      console.error('Error in Supabase operation:', err);
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
    setTimeout(async () => {
      const result = await calculateResellValue(submission);
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
  };
  
  const handleAcceptOffer = async () => {
    if (!calculation) return;
    
    setIsProcessing(true);
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        console.error('User is not authenticated');
        return;
      }
      
      // Update status in Supabase
      const { error } = await fromTable('resell_data')
        .update({ status: 'accepted' })
        .eq('calculated_price', calculation.calculatedPrice)
        .eq('desired_price', calculation.customerPrice);
        
      if (error) throw error;
      
      toast({
        title: "Offer Accepted",
        description: `Your resell request for ${calculation.customerPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'})} has been processed successfully.`,
      });
      
      // Reset form to start again
      setCalculation(null);
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast({
        title: "Error",
        description: "There was a problem processing your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleAcceptCounteroffer = async () => {
    if (!calculation) return;
    
    setIsProcessing(true);
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        console.error('User is not authenticated');
        return;
      }
      
      // Update status in Supabase
      const { error } = await fromTable('resell_data')
        .update({ status: 'counteroffer_accepted' })
        .eq('calculated_price', calculation.calculatedPrice)
        .eq('desired_price', calculation.customerPrice);
        
      if (error) throw error;
      
      toast({
        title: "Counteroffer Accepted",
        description: `You've accepted our offer of ${calculation.calculatedPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}. Your request is being processed.`,
      });
      
      // Reset form to start again
      setCalculation(null);
    } catch (error) {
      console.error('Error accepting counteroffer:', error);
      toast({
        title: "Error",
        description: "There was a problem processing your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
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
          {calculation ? (
            <ResellResult 
              calculation={calculation} 
              onReset={handleReset}
              onAcceptOffer={handleAcceptOffer}
              onAcceptCounteroffer={handleAcceptCounteroffer}
            />
          ) : (
            <ResellForm 
              onSubmit={handleSubmit} 
              isCalculating={isCalculating || isProcessing} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResellTab;
