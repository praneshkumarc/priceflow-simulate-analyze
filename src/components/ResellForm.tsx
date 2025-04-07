
import React, { useState, useRef } from 'react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Card,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useForm } from 'react-hook-form';
import { PhoneCondition, ResellSubmission } from '@/types';
import { Smartphone, Upload, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { dataService } from '@/services/dataService';
import { useToast } from '@/hooks/use-toast';

interface ResellFormProps {
  onSubmit: (data: ResellSubmission) => void;
  isCalculating: boolean;
}

const ResellForm: React.FC<ResellFormProps> = ({ onSubmit, isCalculating }) => {
  const [showCustomCondition, setShowCustomCondition] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Get dataset for model suggestions
  const dataset = dataService.getDataset();
  const phoneModels = Array.from(new Set(
    dataset.map(item => `${item.Brand} ${item.Model}`)
  )).sort();
  
  const form = useForm<ResellSubmission>({
    defaultValues: {
      phoneModel: '',
      purchaseYear: new Date().getFullYear() - 1,
      condition: 'Excellent',
      customConditionDescription: '',
      desiredPrice: 0,
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or text file",
          variant: "destructive",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };
  
  const handleConditionChange = (value: PhoneCondition) => {
    form.setValue('condition', value);
    setShowCustomCondition(value === 'Custom');
  };
  
  const handleSubmitForm = (data: ResellSubmission) => {
    // Add the file to the submission
    const submission: ResellSubmission = {
      ...data,
      billFile: selectedFile || undefined
    };
    
    onSubmit(submission);
  };
  
  // Generate year options from 2010 to current year
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => currentYear - i);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="phoneModel"
            rules={{ required: "Phone model is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Model</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="e.g., Apple iPhone 13" 
                      {...field}
                      list="phone-models"
                      className="pl-9" 
                    />
                    <Smartphone className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
                    <datalist id="phone-models">
                      {phoneModels.map((model, index) => (
                        <option key={index} value={model} />
                      ))}
                    </datalist>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="purchaseYear"
            rules={{ required: "Purchase year is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Year</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Select purchase year" />
                      <Calendar className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="condition"
            rules={{ required: "Condition is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Condition</FormLabel>
                <Select
                  onValueChange={(value) => handleConditionChange(value as PhoneCondition)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select phone condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent (Like New)</SelectItem>
                    <SelectItem value="Good">Good (Minor Wear)</SelectItem>
                    <SelectItem value="Fair">Fair (Noticeable Wear)</SelectItem>
                    <SelectItem value="Poor">Poor (Significant Wear)</SelectItem>
                    <SelectItem value="Custom">Custom (Describe Condition)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="desiredPrice"
            rules={{ 
              required: "Desired price is required",
              validate: value => value > 0 || "Price must be greater than 0" 
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desired Selling Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter your desired price" 
                    min="0"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {showCustomCondition && (
          <FormField
            control={form.control}
            name="customConditionDescription"
            rules={{ 
              required: "Please describe the condition of your phone" 
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Describe Phone Condition</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe any damage, issues, or special conditions of your phone..."
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div>
          <FormLabel htmlFor="bill-upload">Upload Digital Bill (Optional)</FormLabel>
          <div className="mt-1">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="bill-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF or TXT (Optional)</p>
                </div>
                <input
                  id="bill-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {selectedFile.name}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isCalculating}>
            {isCalculating ? 'Calculating...' : 'Calculate Resell Value'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ResellForm;
