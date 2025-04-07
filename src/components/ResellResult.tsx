
import React from 'react';
import { ResellCalculation } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase, fromTable } from '@/integrations/supabase/client';

interface ResellResultProps {
  calculation: ResellCalculation;
  onReset: () => void;
  onAcceptOffer?: () => void;
  onAcceptCounteroffer?: () => void;
}

const ResellResult: React.FC<ResellResultProps> = ({ 
  calculation, 
  onReset,
  onAcceptOffer,
  onAcceptCounteroffer
}) => {
  const { toast } = useToast();
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getStatusColor = () => {
    switch (calculation.decision) {
      case 'Approved':
        return 'bg-green-50 border-green-200';
      case 'Counteroffer':
        return 'bg-yellow-50 border-yellow-200';
      case 'Rejected':
        return 'bg-red-50 border-red-200';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (calculation.decision) {
      case 'Approved':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'Counteroffer':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusTitle = () => {
    switch (calculation.decision) {
      case 'Approved':
        return 'Offer Approved';
      case 'Counteroffer':
        return 'Counteroffer';
      case 'Rejected':
        return 'Offer Rejected';
      default:
        return '';
    }
  };

  const handleAcceptCounteroffer = async () => {
    try {
      // Save the counteroffer acceptance to Supabase
      const { data, error } = await fromTable('resell_data')
        .insert({
          phone_model: calculation.customerPrice.toString(), // This should be improved with actual phone model data
          condition: 'Approved via counteroffer',
          purchase_year: new Date().getFullYear(),
          desired_price: calculation.customerPrice,
          calculated_price: calculation.calculatedPrice,
          status: 'accepted_counteroffer',
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Counteroffer Accepted",
        description: `You've accepted our offer of ${formatCurrency(calculation.calculatedPrice)}`,
      });

      // Call the passed callback if it exists
      if (onAcceptCounteroffer) {
        onAcceptCounteroffer();
      }
    } catch (error) {
      console.error('Error accepting counteroffer:', error);
      toast({
        title: "Error",
        description: "There was a problem accepting the counteroffer. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAcceptOffer = async () => {
    try {
      // Save the offer acceptance to Supabase
      const { data, error } = await fromTable('resell_data')
        .insert({
          phone_model: calculation.customerPrice.toString(), // This should be improved with actual phone model data
          condition: 'Approved directly',
          purchase_year: new Date().getFullYear(),
          desired_price: calculation.customerPrice,
          calculated_price: calculation.calculatedPrice,
          status: 'accepted',
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Offer Accepted",
        description: "Your resell request has been processed successfully.",
      });

      // Call the passed callback if it exists
      if (onAcceptOffer) {
        onAcceptOffer();
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast({
        title: "Error",
        description: "There was a problem accepting the offer. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Alert className={getStatusColor()}>
        {getStatusIcon()}
        <AlertTitle>{getStatusTitle()}</AlertTitle>
        <AlertDescription>{calculation.message}</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Offer</CardTitle>
            <CardDescription>The price you requested</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(calculation.customerPrice)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Calculated Value</CardTitle>
            <CardDescription>Based on market analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(calculation.calculatedPrice)}
            </div>
            <div className={cn(
              "text-sm mt-1",
              calculation.percentageDifference > 0 
                ? "text-red-600" 
                : calculation.percentageDifference < 0 
                  ? "text-blue-600" 
                  : ""
            )}>
              {formatPercentage(calculation.percentageDifference)} difference
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price Calculation Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between pb-2 border-b">
              <span>Base Market Price:</span>
              <span className="font-medium">{formatCurrency(calculation.basePrice)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Year Depreciation:</span>
              <span>-{formatCurrency(calculation.yearDepreciation)}</span>
            </div>
            <div className={cn(
              "flex justify-between",
              calculation.demandAdjustment >= 0 ? "text-green-600" : "text-red-600"
            )}>
              <span>Demand Adjustment:</span>
              <span>{calculation.demandAdjustment >= 0 ? '+' : '-'}{formatCurrency(Math.abs(calculation.demandAdjustment))}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Condition Depreciation:</span>
              <span>-{formatCurrency(calculation.conditionDepreciation)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Inflation Adjustment:</span>
              <span>+{formatCurrency(calculation.inflationAdjustment)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t text-lg font-bold">
              <span>Final Calculated Value:</span>
              <span>{formatCurrency(calculation.calculatedPrice)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onReset}>
            Try Again
          </Button>
          {calculation.decision === 'Approved' && (
            <Button onClick={handleAcceptOffer}>
              Accept Offer & Proceed
            </Button>
          )}
          {calculation.decision === 'Counteroffer' && (
            <Button onClick={handleAcceptCounteroffer}>
              Accept Counteroffer
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResellResult;
