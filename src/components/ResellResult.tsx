
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fromTable } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ResellData } from '@/types/resell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calculateResellPrice, evaluateResellPrice } from '@/utils/resellCalculations';

interface ResellResultProps {
  resellData: {
    id: string;
    phoneModel: string;
    condition: string;
    customConditionDescription?: string;
    purchaseYear: number;
    desiredPrice: number;
    calculatedPrice: number;
  };
  onBack: () => void;
  onAccept?: () => void;
  onRevise?: () => void;
}

export default function ResellResult({ 
  resellData, 
  onBack, 
  onAccept, 
  onRevise 
}: ResellResultProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const evaluation = evaluateResellPrice(
    resellData.calculatedPrice,
    resellData.desiredPrice
  );
  
  const handleAccept = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to complete this action",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await fromTable<ResellData>('resell_data')
        .update({ status: 'accepted' })
        .eq('id', resellData.id);
      
      if (error) {
        console.error('Error accepting offer:', error);
        toast({
          title: "Error",
          description: "Failed to accept offer",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "You've accepted our offer. We'll contact you with next steps.",
      });
      
      if (onAccept) onAccept();
    } catch (error) {
      console.error('Exception accepting offer:', error);
      toast({
        title: "Error",
        description: "Failed to accept offer",
        variant: "destructive",
      });
    }
  };
  
  const handleRevise = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to complete this action",
        variant: "destructive",
      });
      return;
    }
    
    if (onRevise) onRevise();
  };
  
  const getStatusIcon = () => {
    switch (evaluation.decision) {
      case 'accept':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'counter':
        return <AlertCircle className="h-12 w-12 text-yellow-500" />;
      case 'reject':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = () => {
    switch (evaluation.decision) {
      case 'accept':
        return "bg-green-50 border-green-200";
      case 'counter':
        return "bg-yellow-50 border-yellow-200";
      case 'reject':
        return "bg-red-50 border-red-200";
      default:
        return "";
    }
  };
  
  return (
    <Card className={`w-full border-2 ${getStatusColor()}`}>
      <CardHeader className="flex flex-row items-center gap-4">
        {getStatusIcon()}
        <div>
          <CardTitle>Resell Evaluation</CardTitle>
          <CardDescription>
            {evaluation.decision === 'accept' 
              ? "Your offer has been accepted!" 
              : evaluation.decision === 'counter' 
                ? "We have a counter-offer for you" 
                : "We cannot accept your offer"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Phone Model</h3>
            <p className="font-medium">{resellData.phoneModel}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Condition</h3>
            <p className="font-medium">{resellData.condition}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Purchase Year</h3>
            <p className="font-medium">{resellData.purchaseYear}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Age</h3>
            <p className="font-medium">{new Date().getFullYear() - resellData.purchaseYear} years</p>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Your Price</h3>
              <p className="text-xl font-bold">${resellData.desiredPrice.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Our Calculated Price</h3>
              <p className="text-xl font-bold">${resellData.calculatedPrice.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-md bg-slate-50 border">
            <h3 className="font-medium mb-2">Evaluation Result</h3>
            <p>{evaluation.message}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Price difference: ${Math.abs(evaluation.priceDifference).toFixed(2)} 
              ({evaluation.percentageDiff > 0 ? '+' : ''}{evaluation.percentageDiff.toFixed(1)}%)
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          Back
        </Button>
        
        {evaluation.decision === 'accept' && (
          <Button onClick={handleAccept} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
            Accept Offer
          </Button>
        )}
        
        {evaluation.decision === 'counter' && (
          <>
            <Button variant="outline" onClick={handleRevise} className="w-full sm:w-auto">
              Revise Offer
            </Button>
            <Button onClick={handleAccept} className="w-full sm:w-auto">
              Accept Counter-Offer
            </Button>
          </>
        )}
        
        {evaluation.decision === 'reject' && (
          <Button onClick={handleRevise} className="w-full sm:w-auto">
            Revise Offer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
