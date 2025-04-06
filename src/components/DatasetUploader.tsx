
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import Papa from 'papaparse';
import { SmartphoneInputData } from '@/types';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useDatasetUploader } from '@/utils/datasetUploader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DatasetUploaderProps {
  onDatasetProcessed?: (data: any[]) => void;
}

const DatasetUploader: React.FC<DatasetUploaderProps> = ({ onDatasetProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<SmartphoneInputData[]>([]);
  const [datasetName, setDatasetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadDataset } = useDatasetUploader();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setDatasetName(selectedFile.name.split('.')[0]); // Set default name from filename
      setUploadSuccess(false);
      setUploadError(null);
      setParsedData([]);
    }
  };

  const parseCSV = (file: File): Promise<SmartphoneInputData[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          try {
            const data = results.data as any[];
            // Transform the data to match SmartphoneInputData structure
            const transformedData: SmartphoneInputData[] = data
              .filter(row => row.Brand && row.Model) // Filter out empty rows
              .map(row => {
                // Handle nested specifications
                const specs = {
                  Storage: row.Storage || '',
                  RAM: row.RAM || '',
                  "Processor Type": row["Processor Type"] || '',
                  "Display Hz": row["Display Hz"] || 60,
                  "Camera MP": row["Camera MP"] || 0,
                  "Battery Capacity": row["Battery Capacity"] || '',
                  OS: row.OS || undefined,
                  Color: row.Color || undefined
                };

                return {
                  Brand: row.Brand,
                  Model: row.Model,
                  Price: row.Price,
                  "Original Price": row["Original Price"] || row.Price,
                  Stock: row.Stock || 0,
                  Category: row.Category || 'Smartphones',
                  Specifications: specs,
                  "Month of Sale": row["Month of Sale"],
                  "Seasonal Effect": row["Seasonal Effect"],
                  "Competitor Price": row["Competitor Price"],
                  "Demand Level": row["Demand Level"],
                  year_of_sale: row.year_of_sale || new Date().getFullYear()
                };
              });
            resolve(transformedData);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file first');
      return;
    }

    if (!datasetName.trim()) {
      setUploadError('Please provide a dataset name');
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to upload datasets',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setProgress(10);
    setUploadError(null);

    try {
      // Parse the CSV file
      setProgress(30);
      const parsedData = await parseCSV(file);
      setParsedData(parsedData);
      setProgress(60);

      // Save to dataService
      dataService.updateDataset(parsedData);
      setProgress(80);

      // Save to Supabase using the utility function
      const result = await uploadDataset(datasetName, parsedData, 'smartphone_data');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload dataset');
      }

      setProgress(100);
      setUploadSuccess(true);
      toast({
        title: 'Success',
        description: `Dataset "${datasetName}" uploaded successfully with ${parsedData.length} records`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // If a callback was provided, call it with the parsed data
      if (onDatasetProcessed) {
        onDatasetProcessed(parsedData);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload dataset');
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload dataset',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setDatasetName('');
    setUploadSuccess(false);
    setUploadError(null);
    setParsedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Dataset</CardTitle>
        <CardDescription>
          Upload your smartphone sales data in CSV format to analyze pricing trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="preview" disabled={parsedData.length === 0}>
              Preview Data
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="space-y-4">
            <div className="grid w-full gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataset-name">Dataset Name</Label>
                <Input
                  id="dataset-name"
                  placeholder="Enter a name for this dataset"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  disabled={uploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-upload">CSV File</Label>
                <Input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file with smartphone data. Required columns: Brand, Model, Price
                </p>
              </div>
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              {uploadSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Dataset uploaded successfully with {parsedData.length} records
                  </AlertDescription>
                </Alert>
              )}
              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          <TabsContent value="preview">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>RAM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 5).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.Brand}</TableCell>
                      <TableCell>{row.Model}</TableCell>
                      <TableCell>{row.Price}</TableCell>
                      <TableCell>{row.Stock}</TableCell>
                      <TableCell>{row.Specifications.Storage}</TableCell>
                      <TableCell>{row.Specifications.RAM}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedData.length > 5 && (
                <div className="py-2 px-4 text-sm text-muted-foreground">
                  Showing 5 of {parsedData.length} records
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetForm} disabled={uploading}>
          Reset
        </Button>
        <Button onClick={handleUpload} disabled={uploading || !file}>
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Dataset'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DatasetUploader;
