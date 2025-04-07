import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';

interface DatasetUploaderProps {
  onDatasetProcessed?: (data: any[]) => void;
}

const DatasetUploader: React.FC<DatasetUploaderProps> = ({ onDatasetProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [datasetType, setDatasetType] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const droppedFile = acceptedFiles[0];
    setFile(droppedFile);

    Papa.parse(droppedFile, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        setParsedData(results.data);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        toast({
          title: 'Error',
          description: 'Failed to parse CSV file',
          variant: 'destructive',
        });
      },
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to upload datasets',
        variant: 'destructive',
      });
      return;
    }

    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    if (!datasetType) {
      toast({
        title: 'Error',
        description: 'Please select a dataset type',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const rowCount = parsedData.length;
      const columnCount = rowCount > 0 ? Object.keys(parsedData[0]).length : 0;

      // Using type assertion since the table might not be in the Database type
      const { error } = await supabase
        .from('uploaded_datasets' as any)
        .insert({
          user_id: user.id,
          name: file.name,
          file_data: parsedData,
          dataset_type: datasetType,
          row_count: rowCount,
          column_count: columnCount
        } as any);

      if (error) {
        console.error('Error saving dataset:', error);
        toast({
          title: 'Error',
          description: 'Failed to save dataset',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Dataset saved successfully',
        });

        // Notify parent component that dataset has been processed
        if (onDatasetProcessed) {
          onDatasetProcessed(parsedData);
        }
      }
    } catch (error) {
      console.error('Exception saving dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to save dataset',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Dataset</CardTitle>
      </CardHeader>
      <CardContent>
        <div {...getRootProps()} className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer">
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center space-x-2">
              <File className="h-4 w-4 text-green-500" />
              <span>{file.name}</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
              )}
            </div>
          )}
        </div>
        <Select onValueChange={setDatasetType}>
          <SelectTrigger className="w-full mt-4">
            <SelectValue placeholder="Select dataset type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales Data</SelectItem>
            <SelectItem value="product">Product Data</SelectItem>
            <SelectItem value="smartphone">Smartphone Data</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={uploading} className="w-full">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DatasetUploader;
