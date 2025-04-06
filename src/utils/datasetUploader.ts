
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export async function uploadDatasetToSupabase(
  userId: string,
  fileName: string,
  fileData: any,
  datasetType: string
) {
  if (!userId) {
    console.error('User ID is required to save dataset');
    return { success: false, error: 'User ID is required' };
  }

  try {
    const rowCount = Array.isArray(fileData) ? fileData.length : 0;
    const columnCount = rowCount > 0 && typeof fileData[0] === 'object' ? Object.keys(fileData[0]).length : 0;

    // We can't directly reference tables that aren't in the Database type
    // So we'll use the generic insert method
    const { data, error } = await supabase
      .from('uploaded_datasets')
      .insert({
        user_id: userId,
        name: fileName,
        file_data: fileData,
        dataset_type: datasetType,
        row_count: rowCount,
        column_count: columnCount
      } as any)
      .select();

    if (error) {
      console.error('Error saving dataset to Supabase:', error);
      return { success: false, error: error.message };
    }

    console.log('Dataset saved to Supabase:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Exception saving dataset to Supabase:', error);
    return { success: false, error: error.message };
  }
}

export function useDatasetUploader() {
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadDataset = async (fileName: string, fileData: any, datasetType: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to upload datasets',
        variant: 'destructive',
      });
      return { success: false, error: 'Authentication required' };
    }

    const result = await uploadDatasetToSupabase(user.id, fileName, fileData, datasetType);
    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Dataset uploaded successfully',
      });
    } else {
      toast({
        title: 'Error',
        description: `Failed to upload dataset: ${result.error}`,
        variant: 'destructive',
      });
    }

    return result;
  };

  return { uploadDataset };
}
