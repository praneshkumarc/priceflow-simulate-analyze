
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dqcdsvsiqgtyidmqvosh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxY2RzdnNpcWd0eWlkbXF2b3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDg4NTMsImV4cCI6MjA1ODI4NDg1M30.AN83ePQUy7ae1DXnERBLUkJPqaOTpd1LwwaOAwrj-Us";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Define a custom type for tables that aren't automatically added to the type definitions
export type CustomTables = {
  smartphone_data: {
    id: string;
    user_id: string;
    brand: string;
    model: string;
    release_year?: number;
    specifications?: any;
    market_price?: number;
  };
  resell_data: {
    id: string;
    user_id: string;
    phone_model: string;
    condition: string;
    purchase_year: number;
    desired_price: number;
    calculated_price?: number;
    status?: string;
    custom_condition_description?: string;
  };
};

// Function to access tables not in the auto-generated types
export function fromTable<T extends keyof CustomTables>(tableName: T) {
  return supabase.from(tableName as string);
}
