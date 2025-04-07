export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      dashboard_data: {
        Row: {
          created_at: string
          id: string
          metrics: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metrics?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      data_collection: {
        Row: {
          column_count: number
          created_at: string
          data: Json
          dataset_name: string
          dataset_type: string
          id: string
          row_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          column_count: number
          created_at?: string
          data: Json
          dataset_name: string
          dataset_type: string
          id?: string
          row_count: number
          updated_at?: string
          user_id: string
        }
        Update: {
          column_count?: number
          created_at?: string
          data?: Json
          dataset_name?: string
          dataset_type?: string
          id?: string
          row_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      discount_simulation_data: {
        Row: {
          created_at: string
          discount_percentage: number
          discount_price: number
          expected_sales_increase: number | null
          id: string
          original_price: number
          product_id: string | null
          profit_impact: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discount_percentage: number
          discount_price: number
          expected_sales_increase?: number | null
          id?: string
          original_price: number
          product_id?: string | null
          profit_impact?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discount_percentage?: number
          discount_price?: number
          expected_sales_increase?: number | null
          id?: string
          original_price?: number
          product_id?: string | null
          profit_impact?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_simulation_data_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_data"
            referencedColumns: ["id"]
          },
        ]
      }
      price_prediction_data: {
        Row: {
          base_price: number
          confidence: number | null
          created_at: string
          factors: Json | null
          id: string
          predicted_price: number
          product_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price: number
          confidence?: number | null
          created_at?: string
          factors?: Json | null
          id?: string
          predicted_price: number
          product_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price?: number
          confidence?: number | null
          created_at?: string
          factors?: Json | null
          id?: string
          predicted_price?: number
          product_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_prediction_data_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_data"
            referencedColumns: ["id"]
          },
        ]
      }
      price_predictions: {
        Row: {
          base_price: number
          confidence: number | null
          cost_price: number | null
          created_at: string
          factors: Json | null
          id: string
          model_name: string | null
          optimal_price: number
          product_id: string | null
          profit_margin: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price: number
          confidence?: number | null
          cost_price?: number | null
          created_at?: string
          factors?: Json | null
          id?: string
          model_name?: string | null
          optimal_price: number
          product_id?: string | null
          profit_margin?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price?: number
          confidence?: number | null
          cost_price?: number | null
          created_at?: string
          factors?: Json | null
          id?: string
          model_name?: string | null
          optimal_price?: number
          product_id?: string | null
          profit_margin?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_predictions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_data: {
        Row: {
          brand: string
          category: string | null
          created_at: string
          id: string
          model: string
          name: string
          price: number
          specifications: Json | null
          stock_quantity: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand: string
          category?: string | null
          created_at?: string
          id?: string
          model: string
          name: string
          price: number
          specifications?: Json | null
          stock_quantity?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string
          category?: string | null
          created_at?: string
          id?: string
          model?: string
          name?: string
          price?: number
          specifications?: Json | null
          stock_quantity?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          demand: string | null
          id: string
          image_url: string | null
          margin: number | null
          name: string
          price: number
          seasonality: string | null
          sku: string
          trend: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          demand?: string | null
          id?: string
          image_url?: string | null
          margin?: number | null
          name: string
          price: number
          seasonality?: string | null
          sku: string
          trend?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          demand?: string | null
          id?: string
          image_url?: string | null
          margin?: number | null
          name?: string
          price?: number
          seasonality?: string | null
          sku?: string
          trend?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resell_data: {
        Row: {
          calculated_price: number | null
          condition: string
          created_at: string
          custom_condition_description: string | null
          desired_price: number
          id: string
          phone_model: string
          purchase_year: number
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calculated_price?: number | null
          condition: string
          created_at?: string
          custom_condition_description?: string | null
          desired_price: number
          id?: string
          phone_model: string
          purchase_year: number
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calculated_price?: number | null
          condition?: string
          created_at?: string
          custom_condition_description?: string | null
          desired_price?: number
          id?: string
          phone_model?: string
          purchase_year?: number
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          category: string
          created_at: string
          customer_type: string
          date: string
          id: string
          product: string
          quantity: number
          region: string
          total_sales: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          customer_type: string
          date: string
          id?: string
          product: string
          quantity: number
          region: string
          total_sales: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          customer_type?: string
          date?: string
          id?: string
          product?: string
          quantity?: number
          region?: string
          total_sales?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      sales_analysis_data: {
        Row: {
          created_at: string
          customer_type: string | null
          date: string
          id: string
          product_id: string | null
          quantity: number
          region: string | null
          revenue: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_type?: string | null
          date: string
          id?: string
          product_id?: string | null
          quantity: number
          region?: string | null
          revenue: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_type?: string | null
          date?: string
          id?: string
          product_id?: string | null
          quantity?: number
          region?: string | null
          revenue?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_analysis_data_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_data"
            referencedColumns: ["id"]
          },
        ]
      }
      smartphone_data: {
        Row: {
          brand: string
          created_at: string
          id: string
          market_price: number | null
          model: string
          release_year: number | null
          specifications: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand: string
          created_at?: string
          id?: string
          market_price?: number | null
          model: string
          release_year?: number | null
          specifications?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string
          created_at?: string
          id?: string
          market_price?: number | null
          model?: string
          release_year?: number | null
          specifications?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stock_data_cache: {
        Row: {
          data: Json
          endpoint: string
          id: string
          key: string
          symbol: string
          timestamp: string
        }
        Insert: {
          data: Json
          endpoint: string
          id?: string
          key: string
          symbol: string
          timestamp?: string
        }
        Update: {
          data?: Json
          endpoint?: string
          id?: string
          key?: string
          symbol?: string
          timestamp?: string
        }
        Relationships: []
      }
      uploaded_datasets: {
        Row: {
          column_count: number
          created_at: string
          dataset_type: string
          file_data: Json
          id: string
          name: string
          row_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          column_count: number
          created_at?: string
          dataset_type: string
          file_data: Json
          id?: string
          name: string
          row_count: number
          updated_at?: string
          user_id: string
        }
        Update: {
          column_count?: number
          created_at?: string
          dataset_type?: string
          file_data?: Json
          id?: string
          name?: string
          row_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_price_predictions: {
        Row: {
          base_price: number
          confidence: number | null
          created_at: string | null
          factors: Json | null
          id: string
          optimal_price: number
          product_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          base_price: number
          confidence?: number | null
          created_at?: string | null
          factors?: Json | null
          id?: string
          optimal_price: number
          product_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          base_price?: number
          confidence?: number | null
          created_at?: string | null
          factors?: Json | null
          id?: string
          optimal_price?: number
          product_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_price_predictions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_products: {
        Row: {
          base_price: number
          category: string
          cost: number
          created_at: string | null
          id: string
          inventory: number | null
          model: string
          name: string
          seasonality: number | null
          specifications: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          base_price: number
          category: string
          cost: number
          created_at?: string | null
          id?: string
          inventory?: number | null
          model: string
          name: string
          seasonality?: number | null
          specifications?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          base_price?: number
          category?: string
          cost?: number
          created_at?: string | null
          id?: string
          inventory?: number | null
          model?: string
          name?: string
          seasonality?: number | null
          specifications?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
