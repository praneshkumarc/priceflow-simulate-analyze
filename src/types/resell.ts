
export interface ResellData {
  id: string;
  user_id: string;
  phone_model: string;
  condition: string;
  custom_condition_description?: string;
  purchase_year: number;
  desired_price: number;
  calculated_price?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SmartphoneData {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  specifications?: any;
  market_price?: number;
  release_year?: number;
  created_at?: string;
  updated_at?: string;
}

export type PhoneCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface ResellFormData {
  phoneModel: string;
  condition: PhoneCondition;
  customConditionDescription?: string;
  purchaseYear: number;
  desiredPrice: number;
}
