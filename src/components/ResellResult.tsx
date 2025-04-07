
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
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ResellResultProps {
  calculation: ResellCalculation;
  onReset: () => void;
  onAcceptOffer: (calculation: ResellCalculation) => void;
}

const ResellResult: React.FC<ResellResultProps> = ({ calculation, onReset, onAcceptOffer }) => {
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
        return 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800';
      case 'Counteroffer':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800';
      case 'Rejected':
        return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (calculation.decision) {
      case 'Approved':
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'Counteroffer':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
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

  const handleAcceptOffer = () => {
    onAcceptOffer(calculation);
    toast({
      title: "Offer Accepted",
      description: "Your transaction has been processed successfully.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Alert className={cn("border-l-4", getStatusColor())}>
        <div className="flex items-center">
          {getStatusIcon()}
          <AlertTitle className="ml-2">{getStatusTitle()}</AlertTitle>
        </div>
        <AlertDescription className="mt-2">{calculation.message}</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
            <CardTitle>Your Offer</CardTitle>
            <CardDescription>The price you requested</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(calculation.customerPrice)}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
            <CardTitle>Our Calculated Value</CardTitle>
            <CardDescription>Based on market analysis</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(calculation.calculatedPrice)}
            </div>
            <div className={cn(
              "flex items-center text-sm mt-2 font-medium",
              calculation.percentageDifference > 0 
                ? "text-red-600 dark:text-red-400" 
                : calculation.percentageDifference < 0 
                  ? "text-blue-600 dark:text-blue-400" 
                  : ""
            )}>
              {calculation.percentageDifference > 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {formatPercentage(calculation.percentageDifference)} difference
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/30">
          <CardTitle>Price Calculation Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between pb-3 border-b dark:border-gray-700">
              <span className="font-medium text-gray-700 dark:text-gray-300">Base Market Price:</span>
              <span className="font-bold">{formatCurrency(calculation.basePrice)}</span>
            </div>
            <div className="flex justify-between items-center text-red-600 dark:text-red-400">
              <span className="flex items-center">
                <TrendingDown className="h-4 w-4 mr-2" />
                Year Depreciation:
              </span>
              <span className="font-medium">-{formatCurrency(calculation.yearDepreciation)}</span>
            </div>
            <div className={cn(
              "flex justify-between items-center",
              calculation.demandAdjustment >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              <span className="flex items-center">
                {calculation.demandAdjustment >= 0 ? 
                  <TrendingUp className="h-4 w-4 mr-2" /> : 
                  <TrendingDown className="h-4 w-4 mr-2" />
                }
                Demand Adjustment:
              </span>
              <span className="font-medium">{calculation.demandAdjustment >= 0 ? '+' : '-'}{formatCurrency(Math.abs(calculation.demandAdjustment))}</span>
            </div>
            <div className="flex justify-between items-center text-red-600 dark:text-red-400">
              <span className="flex items-center">
                <TrendingDown className="h-4 w-4 mr-2" />
                Condition Depreciation:
              </span>
              <span className="font-medium">-{formatCurrency(calculation.conditionDepreciation)}</span>
            </div>
            <div className="flex justify-between items-center text-green-600 dark:text-green-400">
              <span className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Inflation Adjustment:
              </span>
              <span className="font-medium">+{formatCurrency(calculation.inflationAdjustment)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t dark:border-gray-700 text-lg font-bold">
              <span>Final Calculated Value:</span>
              <span>{formatCurrency(calculation.calculatedPrice)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-900/30 py-4">
          <Button variant="outline" onClick={onReset} className="flex items-center">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          {calculation.decision === 'Approved' && (
            <Button onClick={handleAcceptOffer} className="flex items-center bg-green-600 hover:bg-green-700">
              Accept Offer & Proceed
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {calculation.decision === 'Counteroffer' && (
            <Button onClick={handleAcceptOffer} className="flex items-center">
              Accept Counteroffer
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResellResult;
