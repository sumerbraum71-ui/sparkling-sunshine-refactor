export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      order_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          order_id: string
          sender_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          order_id: string
          sender_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          order_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number | null
          coupon_code: string | null
          created_at: string
          discount_amount: number | null
          email: string | null
          id: string
          option_id: string | null
          order_number: string | null
          password: string | null
          product_id: string
          product_option_id: string
          quantity: number
          response_message: string | null
          status: string
          stock_content: string | null
          token_id: string
          total_price: number
          updated_at: string
          verification_link: string | null
        }
        Insert: {
          amount?: number | null
          coupon_code?: string | null
          created_at?: string
          discount_amount?: number | null
          email?: string | null
          id?: string
          option_id?: string | null
          order_number?: string | null
          password?: string | null
          product_id: string
          product_option_id: string
          quantity?: number
          response_message?: string | null
          status?: string
          stock_content?: string | null
          token_id: string
          total_price: number
          updated_at?: string
          verification_link?: string | null
        }
        Update: {
          amount?: number | null
          coupon_code?: string | null
          created_at?: string
          discount_amount?: number | null
          email?: string | null
          id?: string
          option_id?: string | null
          order_number?: string | null
          password?: string | null
          product_id?: string
          product_option_id?: string
          quantity?: number
          response_message?: string | null
          status?: string
          stock_content?: string | null
          token_id?: string
          total_price?: number
          updated_at?: string
          verification_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_option_id_fkey"
            columns: ["product_option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          account_info: string
          account_name: string | null
          account_number: string | null
          created_at: string
          display_order: number | null
          id: string
          instructions: string | null
          is_active: boolean
          is_visible: boolean | null
          name: string
          sort_order: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          account_info: string
          account_name?: string | null
          account_number?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_visible?: boolean | null
          name: string
          sort_order?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          account_info?: string
          account_name?: string | null
          account_number?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_visible?: boolean | null
          name?: string
          sort_order?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_options: {
        Row: {
          available: number | null
          created_at: string
          description: string | null
          duration: string | null
          estimated_time: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          product_id: string
          sort_order: number | null
          type: string | null
        }
        Insert: {
          available?: number | null
          created_at?: string
          description?: string | null
          duration?: string | null
          estimated_time?: string | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          product_id: string
          sort_order?: number | null
          type?: string | null
        }
        Update: {
          available?: number | null
          created_at?: string
          description?: string | null
          duration?: string | null
          estimated_time?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          product_id?: string
          sort_order?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          available: number | null
          category: string | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          image: string | null
          image_url: string | null
          instant_delivery: boolean | null
          is_active: boolean
          name: string
          price: number | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          available?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image?: string | null
          image_url?: string | null
          instant_delivery?: boolean | null
          is_active?: boolean
          name: string
          price?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          available?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image?: string | null
          image_url?: string | null
          instant_delivery?: boolean | null
          is_active?: boolean
          name?: string
          price?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      recharge_requests: {
        Row: {
          admin_note: string | null
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          payment_method: string | null
          payment_method_id: string | null
          payment_proof: string | null
          processed_at: string | null
          proof_image_url: string | null
          sender_name: string | null
          sender_phone: string | null
          status: string
          token_id: string
          transaction_reference: string | null
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_method_id?: string | null
          payment_proof?: string | null
          processed_at?: string | null
          proof_image_url?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          status?: string
          token_id: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_method_id?: string | null
          payment_proof?: string | null
          processed_at?: string | null
          proof_image_url?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          status?: string
          token_id?: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recharge_requests_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recharge_requests_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          order_id: string | null
          order_number: string | null
          processed_at: string | null
          reason: string
          status: string
          token_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          order_number?: string | null
          processed_at?: string | null
          reason: string
          status?: string
          token_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          order_number?: string | null
          processed_at?: string | null
          reason?: string
          status?: string
          token_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      stock_items: {
        Row: {
          content: string
          created_at: string
          id: string
          is_sold: boolean
          option_id: string | null
          product_id: string | null
          product_option_id: string
          sold_at: string | null
          sold_to_order_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_sold?: boolean
          option_id?: string | null
          product_id?: string | null
          product_option_id: string
          sold_at?: string | null
          sold_to_order_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_sold?: boolean
          option_id?: string | null
          product_id?: string | null
          product_option_id?: string
          sold_at?: string | null
          sold_to_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_items_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_items_product_option_id_fkey"
            columns: ["product_option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_items_sold_to_order_id_fkey"
            columns: ["sold_to_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          balance: number
          created_at: string
          id: string
          is_blocked: boolean | null
          token: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          is_blocked?: boolean | null
          token: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          is_blocked?: boolean | null
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
