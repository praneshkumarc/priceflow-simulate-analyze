
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileCheck, AlertTriangle } from "lucide-react";
import { DatasetUpload, SmartphoneProduct } from '@/types';
import { toast } from '@/hooks/use-toast';

interface DatasetUploaderProps {
  onDatasetProcessed: (data: any) => void;
}

const DatasetUploader: React.FC<DatasetUploaderProps> = ({ onDatasetProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<DatasetUpload[]>([]);
  const [jsonInput, setJsonInput] = useState<string>('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  };
  
  const processCSV = (text: string) => {
    try {
      // Basic CSV parsing
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1).filter(line => line.trim() !== '').map(line => {
        const values = line.split(',').map(val => val.trim());
        return headers.reduce((obj: any, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });
      
      // Transform data into SmartphoneProduct format
      const transformedData = data.map((item: any, index) => ({
        id: `sp-${index + 1}`,
        name: `${item.Brand || 'Unknown'} ${item.Model || `Phone ${index + 1}`}`,
        basePrice: Number(item.Price) || 0,
        category: item.Category || 'Smartphone',
        inventory: Number(item.Stock) || 0,
        cost: Number(item['Original Price']) || 0,
        seasonality: (Number(item['Seasonal Effect']) || 5) / 10,
        specifications: {
          ram: item.RAM || item.Specifications?.RAM || '4GB',
          processor: item['Processor Type'] || item.Specifications?.['Processor Type'] || 'Unknown',
          storage: item.Storage || item.Specifications?.Storage || '64GB',
          display: `${item['Display Hz'] || item.Specifications?.['Display Hz'] || '60'}Hz`,
          camera: `${item['Camera MP'] || item.Specifications?.['Camera MP'] || '12'}MP`,
          battery: item['Battery Capacity'] || item.Specifications?.['Battery Capacity'] || '3000mAh'
        }
      }));
      
      // Create a new entry for upload history
      const newUpload: DatasetUpload = {
        id: Date.now().toString(),
        name: file?.name || 'Unknown dataset',
        dateUploaded: new Date().toISOString(),
        status: 'completed',
        rowCount: data.length,
        productCount: data.length
      };
      
      setUploadHistory(prev => [newUpload, ...prev]);
      
      toast({
        title: "Dataset successfully processed",
        description: `Processed ${data.length} records`,
      });
      
      // Pass processed data to parent component
      onDatasetProcessed(transformedData);
      
      return transformedData;
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast({
        title: "Error processing dataset",
        description: "There was an error parsing the CSV file. Please check the format and try again.",
        variant: "destructive",
      });
      
      // Add error entry to history
      const errorUpload: DatasetUpload = {
        id: Date.now().toString(),
        name: file?.name || 'Unknown dataset',
        dateUploaded: new Date().toISOString(),
        status: 'error',
        rowCount: 0,
        productCount: 0
      };
      
      setUploadHistory(prev => [errorUpload, ...prev]);
      return null;
    }
  };

  const processJsonInput = () => {
    try {
      // Try to parse the JSON input
      let jsonData;
      
      // Check if input is an array or single object
      try {
        jsonData = JSON.parse(jsonInput);
        // If it's a single object, wrap it in an array
        if (!Array.isArray(jsonData)) {
          jsonData = [jsonData];
        }
      } catch (e) {
        // Try to parse as a single object by adding square brackets
        try {
          jsonData = JSON.parse(`[${jsonInput}]`);
        } catch (e2) {
          throw new Error("Invalid JSON format");
        }
      }
      
      // Transform data into SmartphoneProduct format
      const transformedData = jsonData.map((item: any, index) => ({
        id: `sp-${index + 1}`,
        name: `${item.Brand || 'Unknown'} ${item.Model || `Phone ${index + 1}`}`,
        basePrice: Number(item.Price) || 0,
        category: item.Category || 'Smartphone',
        inventory: Number(item.Stock) || 0,
        cost: Number(item['Original Price']) || 0,
        seasonality: (Number(item['Seasonal Effect']) || 5) / 10,
        specifications: {
          ram: item.Specifications?.RAM || '4GB',
          processor: item.Specifications?.['Processor Type'] || 'Unknown',
          storage: item.Specifications?.Storage || '64GB',
          display: `${item.Specifications?.['Display Hz'] || '60'}Hz`,
          camera: `${item.Specifications?.['Camera MP'] || '12'}MP`,
          battery: item.Specifications?.['Battery Capacity'] || '3000mAh',
          os: item.Specifications?.OS || 'Unknown',
          color: item.Specifications?.Color || 'Unknown'
        }
      }));

      // Create a new entry for upload history
      const newUpload: DatasetUpload = {
        id: Date.now().toString(),
        name: 'JSON Input',
        dateUploaded: new Date().toISOString(),
        status: 'completed',
        rowCount: transformedData.length,
        productCount: transformedData.length
      };
      
      setUploadHistory(prev => [newUpload, ...prev]);
      
      toast({
        title: "Dataset successfully processed",
        description: `Processed ${transformedData.length} records`,
      });
      
      // Pass processed data to parent component
      onDatasetProcessed(transformedData);
      
      // Clear JSON input
      setJsonInput('');
      
      return transformedData;
    } catch (error) {
      console.error("Error processing JSON:", error);
      toast({
        title: "Error processing JSON data",
        description: "There was an error parsing the JSON data. Please check the format and try again.",
        variant: "destructive",
      });
      
      // Add error entry to history
      const errorUpload: DatasetUpload = {
        id: Date.now().toString(),
        name: 'JSON Input',
        dateUploaded: new Date().toISOString(),
        status: 'error',
        rowCount: 0,
        productCount: 0
      };
      
      setUploadHistory(prev => [errorUpload, ...prev]);
      return null;
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Create pending upload record
      const pendingUpload: DatasetUpload = {
        id: Date.now().toString(),
        name: file.name,
        dateUploaded: new Date().toISOString(),
        status: 'processing',
        rowCount: 0,
        productCount: 0
      };
      
      setUploadHistory(prev => [pendingUpload, ...prev]);
      
      // Read file contents
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const processed = processCSV(text);
        setFile(null);
        setIsUploading(false);
      };
      
      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "Could not read the uploaded file. Please try a different file.",
          variant: "destructive",
        });
        setIsUploading(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Error uploading:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const handleSubmitJson = () => {
    if (!jsonInput.trim()) {
      toast({
        title: "No data provided",
        description: "Please enter JSON data to process.",
        variant: "destructive",
      });
      return;
    }
    
    processJsonInput();
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Dataset</CardTitle>
          <CardDescription>
            Upload a CSV file containing your product data or paste JSON data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Option 1: Upload CSV File</h3>
            <div className="flex items-center gap-4">
              <Input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Button 
                onClick={handleUpload} 
                disabled={!file || isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? "Processing..." : "Upload"} <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Option 2: Paste JSON Data</h3>
            <textarea
              className="w-full h-64 border rounded-md p-3 font-mono text-sm"
              placeholder={`Paste your JSON data here, e.g.:
{
  "Brand": "Apple",
  "Model": "iPhone SE (3rd Gen)",
  "Price": "522",
  "Original Price": "345",
  "Stock": 41,
  "Category": "Mid Range",
  "Specifications": {
    "Storage": "512GB",
    "RAM": "6GB",
    "Processor Type": "A16 Bionic",
    "Display Hz": 120,
    "Camera MP": 48,
    "Battery Capacity": "4323mAh",
    "OS": "iOS 16",
    "Color": "Silver"
  },
  "Month of Sale": "August",
  "Seasonal Effect": 8,
  "Competitor Price": 508.3,
  "Demand Level": 5
}`}
              value={jsonInput}
              onChange={handleJsonInputChange}
            />
            <Button 
              onClick={handleSubmitJson} 
              disabled={!jsonInput.trim()}
              className="mt-2"
            >
              Process JSON Data
            </Button>
          </div>
          
          <Alert>
            <AlertDescription>
              For CSV files: Required columns include Brand, Model, Price, Original Price, Stock, Category, and Specifications columns.
              <br />
              For JSON: Format should match the example in the placeholder.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      
      {uploadHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload History</CardTitle>
            <CardDescription>
              Recent dataset uploads and their processing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dataset Name</TableHead>
                  <TableHead>Date Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Products</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadHistory.map((upload) => (
                  <TableRow key={upload.id}>
                    <TableCell>{upload.name}</TableCell>
                    <TableCell>{new Date(upload.dateUploaded).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {upload.status === 'completed' && <FileCheck className="h-4 w-4 text-green-500" />}
                        {upload.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {upload.status}
                      </div>
                    </TableCell>
                    <TableCell>{upload.rowCount}</TableCell>
                    <TableCell>{upload.productCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DatasetUploader;
