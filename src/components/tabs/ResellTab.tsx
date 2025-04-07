
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fromTable } from '@/integrations/supabase/client';
import { ResellFormData, ResellData, SmartphoneData } from '@/types/resell';
import { calculateResellPrice } from '@/utils/resellCalculations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ResellForm from '@/components/ResellForm';
import ResellResult from '@/components/ResellResult';

export default function ResellTab() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');
  const [submittedData, setSubmittedData] = useState<ResellData | null>(null);
  const [resellHistory, setResellHistory] = useState<ResellData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user) {
      fetchResellHistory();
      
      // Add some sample phone data if there's none in the database
      checkAndAddSampleData();
    }
  }, [user]);
  
  const checkAndAddSampleData = async () => {
    try {
      const { data: smartphones, error: fetchError } = await fromTable<SmartphoneData>('smartphone_data')
        .select('*')
        .limit(1);
      
      if (fetchError) {
        console.error('Error checking smartphone data:', fetchError);
        return;
      }
      
      // If no smartphone data exists, add some sample data
      if (!smartphones || smartphones.length === 0) {
        const samplePhones = [
          { brand: 'Apple', model: 'iPhone 13', market_price: 799, release_year: 2021 },
          { brand: 'Apple', model: 'iPhone 12', market_price: 699, release_year: 2020 },
          { brand: 'Samsung', model: 'Galaxy S21', market_price: 799, release_year: 2021 },
          { brand: 'Google', model: 'Pixel 6', market_price: 599, release_year: 2021 },
          { brand: 'Samsung', model: 'Galaxy Note 10', market_price: 949, release_year: 2019 },
          { brand: 'OnePlus', model: '9 Pro', market_price: 969, release_year: 2021 }
        ];
        
        for (const phone of samplePhones) {
          const { error } = await fromTable<SmartphoneData>('smartphone_data')
            .insert({
              user_id: user.id,
              brand: phone.brand,
              model: phone.model,
              market_price: phone.market_price,
              release_year: phone.release_year,
              specifications: {
                storage: '128GB',
                ram: '8GB',
                camera: '12MP'
              }
            });
          
          if (error) {
            console.error('Error adding sample phone data:', error);
          }
        }
      }
    } catch (error) {
      console.error('Exception checking smartphone data:', error);
    }
  };
  
  const fetchResellHistory = async () => {
    if (!user) return;
    
    try {
      setLoadingHistory(true);
      const { data, error } = await fromTable<ResellData>('resell_data')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching resell history:', error);
        toast({
          title: "Error",
          description: "Failed to load your resell history",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        setResellHistory(data);
      }
    } catch (error) {
      console.error('Exception fetching resell history:', error);
      toast({
        title: "Error",
        description: "Failed to load your resell history",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };
  
  const findPhoneBasePrice = async (phoneModel: string): Promise<number> => {
    try {
      // Extract brand and model
      const parts = phoneModel.split(' ');
      const brand = parts[0];
      const model = parts.slice(1).join(' ');
      
      const { data: smartphones, error } = await fromTable<SmartphoneData>('smartphone_data')
        .select('market_price')
        .ilike('brand', `%${brand}%`)
        .ilike('model', `%${model}%`)
        .limit(1);
      
      if (error) {
        console.error('Error finding phone base price:', error);
        return 0;
      }
      
      if (smartphones && smartphones.length > 0 && smartphones[0].market_price) {
        return smartphones[0].market_price;
      }
      
      // Default prices if phone not found in database
      const defaultPrices: Record<string, number> = {
        'iPhone': 699,
        'Galaxy': 599,
        'Pixel': 499,
        'OnePlus': 599
      };
      
      // Check if brand exists in default prices
      for (const [key, value] of Object.entries(defaultPrices)) {
        if (phoneModel.includes(key)) {
          return value;
        }
      }
      
      // Default fallback price
      return 500;
    } catch (error) {
      console.error('Exception finding phone base price:', error);
      return 500; // Default fallback price
    }
  };
  
  const handleSubmit = async (data: ResellFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit a resell request",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Find base price for the phone model
      const basePrice = await findPhoneBasePrice(data.phoneModel);
      
      // Calculate resell price
      const calculatedPrice = calculateResellPrice(
        basePrice,
        data.purchaseYear,
        data.condition,
        'medium', // Default demand level
        data.customConditionDescription
      );
      
      // Save resell request to database
      const { data: savedData, error } = await fromTable<ResellData>('resell_data')
        .insert({
          user_id: user.id,
          phone_model: data.phoneModel,
          condition: data.condition,
          custom_condition_description: data.customConditionDescription || null,
          purchase_year: data.purchaseYear,
          desired_price: data.desiredPrice,
          calculated_price: calculatedPrice,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error submitting resell request:', error);
        toast({
          title: "Error",
          description: "Failed to submit your resell request",
          variant: "destructive",
        });
        return;
      }
      
      if (savedData) {
        setSubmittedData(savedData);
        setActiveTab('result');
        toast({
          title: "Success",
          description: "Your resell request has been submitted",
        });
      }
    } catch (error) {
      console.error('Exception submitting resell request:', error);
      toast({
        title: "Error",
        description: "Failed to submit your resell request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackToForm = () => {
    setActiveTab('submit');
    setSubmittedData(null);
  };
  
  const handleAcceptOffer = () => {
    setActiveTab('history');
    fetchResellHistory();
  };
  
  const handleReviseOffer = () => {
    setActiveTab('submit');
  };
  
  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await fromTable<ResellData>('resell_data')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive",
        });
        return;
      }
      
      // Refresh the history after updating
      fetchResellHistory();
      
      toast({
        title: "Success",
        description: `Status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Exception updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Phone Resell</h2>
        <p className="text-muted-foreground">
          Submit your used phone for evaluation and get a fair resale value
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="submit">Submit Phone</TabsTrigger>
          {submittedData && <TabsTrigger value="result">Evaluation</TabsTrigger>}
          <TabsTrigger value="history">Your History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="submit" className="space-y-4">
          <ResellForm onSubmit={handleSubmit} loading={loading} />
        </TabsContent>
        
        {submittedData && (
          <TabsContent value="result" className="space-y-4">
            <ResellResult
              resellData={{
                id: submittedData.id,
                phoneModel: submittedData.phone_model,
                condition: submittedData.condition,
                customConditionDescription: submittedData.custom_condition_description,
                purchaseYear: submittedData.purchase_year,
                desiredPrice: submittedData.desired_price,
                calculatedPrice: submittedData.calculated_price || 0,
              }}
              onBack={handleBackToForm}
              onAccept={handleAcceptOffer}
              onRevise={handleReviseOffer}
            />
          </TabsContent>
        )}
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Resell History</CardTitle>
              <CardDescription>
                Track the status of your phone resell requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="text-center py-8">Loading history...</div>
              ) : resellHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  You haven't submitted any resell requests yet
                </div>
              ) : (
                <div className="space-y-6">
                  {resellHistory.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{item.phone_model}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {new Date(item.created_at || '').toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'accepted' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'rejected' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status?.charAt(0).toUpperCase()}{item.status?.slice(1)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Condition</p>
                          <p className="font-medium">{item.condition}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Year</p>
                          <p className="font-medium">{item.purchase_year}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Your Price</p>
                          <p className="font-medium">${item.desired_price}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Our Price</p>
                          <p className="font-medium">${item.calculated_price}</p>
                        </div>
                      </div>
                      
                      {item.status === 'pending' && (
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => handleStatusChange(item.id, 'rejected')}
                            className="text-xs px-3 py-1 rounded border text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
