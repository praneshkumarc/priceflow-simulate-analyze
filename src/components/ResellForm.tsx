
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fromTable } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ResellFormData, SmartphoneData } from '@/types/resell';

const formSchema = z.object({
  phoneModel: z.string().min(2, "Phone model is required"),
  condition: z.enum(["Excellent", "Good", "Fair", "Poor"], {
    required_error: "Please select a condition",
  }),
  customConditionDescription: z.string().optional(),
  purchaseYear: z.coerce.number()
    .min(2010, "Purchase year must be 2010 or later")
    .max(new Date().getFullYear(), "Purchase year cannot be in the future"),
  desiredPrice: z.coerce.number()
    .min(1, "Price must be greater than 0"),
});

interface ResellFormProps {
  onSubmit: (data: ResellFormData) => void;
  loading?: boolean;
}

export default function ResellForm({ onSubmit, loading = false }: ResellFormProps) {
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<ResellFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneModel: "",
      condition: "Good",
      customConditionDescription: "",
      purchaseYear: new Date().getFullYear() - 1,
      desiredPrice: 0,
    },
  });

  useEffect(() => {
    const fetchPhoneModels = async () => {
      try {
        setLoadingModels(true);
        const { data: smartphones, error } = await fromTable<SmartphoneData>('smartphone_data')
          .select('brand, model')
          .order('brand', { ascending: true });
        
        if (error) {
          console.error('Error fetching phone models:', error);
          toast({
            title: "Error",
            description: "Failed to load phone models",
            variant: "destructive",
          });
          return;
        }
        
        if (smartphones && smartphones.length > 0) {
          // Explicitly type and map the smartphones data to string[]
          const modelList = smartphones.map((phone: any) => `${phone.brand} ${phone.model}`);
          setModels([...new Set(modelList)]);
        } else {
          // If no models in database, provide some sample models
          setModels([
            "Apple iPhone 13", 
            "Apple iPhone 12", 
            "Samsung Galaxy S21", 
            "Google Pixel 6",
            "Samsung Galaxy Note 10",
            "OnePlus 9 Pro"
          ]);
        }
      } catch (error) {
        console.error('Exception fetching phone models:', error);
        toast({
          title: "Error",
          description: "Failed to load phone models",
          variant: "destructive",
        });
      } finally {
        setLoadingModels(false);
      }
    };

    fetchPhoneModels();
  }, [toast]);

  const handleSubmit = form.handleSubmit((data) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit a resell request",
        variant: "destructive",
      });
      return;
    }
    onSubmit(data);
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resell Your Phone</CardTitle>
        <CardDescription>
          Enter your phone details and receive a fair resale value estimation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="phoneModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Model</FormLabel>
                  <Select
                    disabled={loadingModels || loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a phone model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the model of your phone
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Rate the current condition of your device
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customConditionDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="Describe any specific damages or issues..."
                      className="h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide any additional information about your device's condition
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="purchaseYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Year</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        type="number"
                        min={2010}
                        max={new Date().getFullYear()}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Year when the phone was purchased
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="desiredPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Desired Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        type="number"
                        min={0}
                        step={0.01}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter your expected selling price
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Submit Request"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
