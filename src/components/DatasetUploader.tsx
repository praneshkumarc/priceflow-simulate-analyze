
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileCheck, AlertTriangle } from "lucide-react";
import { DatasetUpload } from '@/types';
import { toast } from '@/hooks/use-toast';

interface DatasetUploaderProps {
  onDatasetProcessed: (data: any) => void;
}

const DatasetUploader: React.FC<DatasetUploaderProps> = ({ onDatasetProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<DatasetUpload[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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
      
      // Create a new entry for upload history
      const newUpload: DatasetUpload = {
        id: Date.now().toString(),
        name: file?.name || 'Unknown dataset',
        dateUploaded: new Date().toISOString(),
        status: 'completed',
        rowCount: data.length,
        productCount: new Set(data.map((item: any) => item.productId || item.id)).size
      };
      
      setUploadHistory(prev => [newUpload, ...prev]);
      
      toast({
        title: "Dataset successfully processed",
        description: `Processed ${data.length} records`,
      });
      
      // Pass processed data to parent component
      onDatasetProcessed(data);
      
      return data;
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
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Dataset</CardTitle>
          <CardDescription>
            Upload a CSV file containing your product data. The file should include product specifications,
            historical prices, and sales data.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          
          <Alert className="mt-4">
            <AlertDescription>
              File must be in CSV format with headers. Required columns: name, basePrice, category, 
              specifications (JSON format for RAM, processor, etc.)
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
