
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { dataService } from '@/services/dataService';
import { SmartphoneInputData } from '@/types';

interface DatasetUploaderProps {
  onDatasetProcessed?: (data: any[]) => void;
}

const DatasetUploader: React.FC<DatasetUploaderProps> = ({ onDatasetProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadSuccess(false);
      setUploadError('');
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setUploadSuccess(false);
      setUploadError('');
    }
  };
  
  const processFile = async () => {
    if (!file) {
      setUploadError('Please select a file first');
      return;
    }
    
    setUploading(true);
    setUploadError('');
    
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let data: any[] = [];
      
      if (fileExtension === 'json') {
        // Process JSON file
        const text = await file.text();
        data = JSON.parse(text);
        
        // Handle both array and single object formats
        if (!Array.isArray(data)) {
          data = [data];
        }
      } else if (fileExtension === 'csv') {
        // Process CSV file
        const text = await file.text();
        data = parseCSV(text);
      } else {
        throw new Error('Unsupported file format. Please upload a JSON or CSV file.');
      }
      
      // Process smartphone data format
      if (data.length > 0) {
        const processedData = processSmartphoneData(data);
        
        // Update dataset in dataService
        dataService.updateDataset(processedData);
        
        if (onDatasetProcessed) {
          onDatasetProcessed(processedData);
        }
        
        setUploadSuccess(true);
        toast({
          title: "Dataset uploaded successfully",
          description: `${processedData.length} records processed`,
        });
        
        // Also update products in dataService based on the dataset
        updateProductsFromDataset(processedData);
      } else {
        throw new Error('No data found in the file');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadError(error instanceof Error ? error.message : 'Error processing file');
      toast({
        title: "Error uploading dataset",
        description: error instanceof Error ? error.message : 'Error processing file',
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const parseCSV = (csvText: string): any[] => {
    // Simple CSV parser (can be improved for complex CSV files)
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('Invalid CSV format');
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === headers.length) {
        const entry: Record<string, any> = {};
        headers.forEach((header, index) => {
          // Try to convert numerical values
          const value = values[index];
          entry[header] = isNaN(Number(value)) ? value : Number(value);
        });
        data.push(entry);
      }
    }
    
    return data;
  };
  
  const processSmartphoneData = (data: any[]): SmartphoneInputData[] => {
    return data.map(item => {
      let smartphones: SmartphoneInputData;
      
      // Check for specific smartphone data format
      if (item.Brand && item.Model && item.Specifications) {
        // Already in the correct format
        smartphones = item as SmartphoneInputData;
      } else {
        // Try to map fields to the expected format
        const brand = item.brand || item.Brand || item.manufacturer || '';
        const model = item.model || item.Model || item.name || '';
        
        smartphones = {
          Brand: brand,
          Model: model,
          Price: item.price || item.Price || 0,
          "Original Price": item.originalPrice || item["Original Price"] || item.cost || item.Price || 0,
          Stock: item.inventory || item.stock || item.Stock || 10,
          Category: item.category || item.Category || 'Unknown',
          Specifications: {
            Storage: item.storage || (item.specs && item.specs.storage) || '128GB',
            RAM: item.ram || (item.specs && item.specs.ram) || '4GB',
            "Processor Type": item.processor || (item.specs && item.specs.processor) || 'Unknown',
            "Display Hz": item.display || (item.specs && item.specs.display) || 60,
            "Camera MP": item.camera || (item.specs && item.specs.camera) || 12,
            "Battery Capacity": item.battery || (item.specs && item.specs.battery) || '3000mAh',
            OS: item.os || (item.specs && item.specs.os) || undefined,
            Color: item.color || (item.specs && item.specs.color) || undefined
          }
        };
        
        // Add additional fields if they exist
        if (item["Month of Sale"] || item.monthOfSale) {
          smartphones["Month of Sale"] = item["Month of Sale"] || item.monthOfSale;
        }
        
        if (item["Seasonal Effect"] || item.seasonalEffect) {
          smartphones["Seasonal Effect"] = item["Seasonal Effect"] || item.seasonalEffect;
        }
        
        if (item["Competitor Price"] || item.competitorPrice) {
          smartphones["Competitor Price"] = item["Competitor Price"] || item.competitorPrice;
        }
        
        if (item["Demand Level"] || item.demandLevel) {
          smartphones["Demand Level"] = item["Demand Level"] || item.demandLevel;
        }
        
        if (item.year_of_sale || item.yearOfSale) {
          smartphones.year_of_sale = item.year_of_sale || item.yearOfSale;
        }
      }
      
      return smartphones;
    });
  };
  
  const updateProductsFromDataset = (data: SmartphoneInputData[]) => {
    // Convert dataset entries to product objects
    const newProducts = data.map((item, index) => {
      return {
        id: `product-${index}`,
        name: `${item.Brand} ${item.Model}`,
        basePrice: typeof item.Price === 'string' ? parseFloat(item.Price) : item.Price,
        category: item.Category,
        inventory: item.Stock || 10,
        cost: typeof item["Original Price"] === 'string' ? 
          parseFloat(item["Original Price"]) : 
          (item["Original Price"] || 0),
        seasonality: item["Seasonal Effect"] ? item["Seasonal Effect"] / 10 : 0.5,
        specifications: {
          ...item.Specifications,
          brand: item.Brand,
          model: item.Model
        }
      };
    });
    
    // Update products in dataService
    dataService.updateProducts(newProducts);
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dataset Uploader</CardTitle>
        <CardDescription>
          Upload a smartphone dataset file (.json or .csv) to analyze pricing data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,.csv"
          className="hidden"
        />
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <File className="h-10 w-10 text-blue-500" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="h-10 w-10 text-gray-400" />
              <p className="font-medium">Drop your dataset file here or click to browse</p>
              <p className="text-sm text-gray-500">Supports JSON and CSV files</p>
            </div>
          )}
        </div>
        
        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">{uploadError}</span>
          </div>
        )}
        
        {uploadSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm">Dataset uploaded and processed successfully!</span>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <Button
            variant="outline"
            disabled={!file}
            onClick={() => {
              setFile(null);
              setUploadSuccess(false);
              setUploadError('');
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Clear
          </Button>
          
          <Button onClick={processFile} disabled={!file || uploading}>
            {uploading ? (
              <>Processing...</>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Process Dataset
              </>
            )}
          </Button>
        </div>
        
        {file && !uploadSuccess && !uploading && (
          <p className="text-xs text-center mt-4 text-gray-500">
            Click "Process Dataset" to analyze the file
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DatasetUploader;
