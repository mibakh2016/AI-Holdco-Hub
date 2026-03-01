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
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          chunk_text: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          is_active: boolean
          page_number: number | null
        }
        Insert: {
          chunk_text: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          is_active?: boolean
          page_number?: number | null
        }
        Update: {
          chunk_text?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          is_active?: boolean
          page_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          ai_suggested_metadata: Json | null
          confirmed_at: string | null
          created_at: string
          description: string | null
          document_type: string
          effective_date: string | null
          entity_id: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          processing_status: string | null
          shareholder_id: string | null
          status: string
          title: string
          updated_at: string
          uploaded_by: string | null
          valuation_id: string | null
        }
        Insert: {
          ai_suggested_metadata?: Json | null
          confirmed_at?: string | null
          created_at?: string
          description?: string | null
          document_type?: string
          effective_date?: string | null
          entity_id?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          processing_status?: string | null
          shareholder_id?: string | null
          status?: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
          valuation_id?: string | null
        }
        Update: {
          ai_suggested_metadata?: Json | null
          confirmed_at?: string | null
          created_at?: string
          description?: string | null
          document_type?: string
          effective_date?: string | null
          entity_id?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          processing_status?: string | null
          shareholder_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          valuation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "portfolio_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_shareholder_id_fkey"
            columns: ["shareholder_id"]
            isOneToOne: false
            referencedRelation: "shareholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_valuation_id_fkey"
            columns: ["valuation_id"]
            isOneToOne: false
            referencedRelation: "valuations"
            referencedColumns: ["id"]
          },
        ]
      }
      ownership_register: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          price_per_unit: number
          shareholder_id: string
          total_amount: number
          transaction_date: string
          transaction_type: string
          units: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          price_per_unit: number
          shareholder_id: string
          total_amount: number
          transaction_date?: string
          transaction_type?: string
          units: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          price_per_unit?: number
          shareholder_id?: string
          total_amount?: number
          transaction_date?: string
          transaction_type?: string
          units?: number
        }
        Relationships: [
          {
            foreignKeyName: "ownership_register_shareholder_id_fkey"
            columns: ["shareholder_id"]
            isOneToOne: false
            referencedRelation: "shareholders"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_entities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          latest_milestone: string | null
          name: string
          sector: string | null
          stake_percent: number
          status: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          latest_milestone?: string | null
          name: string
          sector?: string | null
          stake_percent?: number
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          latest_milestone?: string | null
          name?: string
          sector?: string | null
          stake_percent?: number
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_requests: {
        Row: {
          buyer_email: string
          buyer_name: string
          created_at: string
          id: string
          status: string
          total_cost: number
          unit_price: number
          units: number
          user_id: string | null
        }
        Insert: {
          buyer_email: string
          buyer_name: string
          created_at?: string
          id?: string
          status?: string
          total_cost: number
          unit_price: number
          units: number
          user_id?: string | null
        }
        Update: {
          buyer_email?: string
          buyer_name?: string
          created_at?: string
          id?: string
          status?: string
          total_cost?: number
          unit_price?: number
          units?: number
          user_id?: string | null
        }
        Relationships: []
      }
      shareholders: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          joined_date: string
          ownership_percent: number
          phone: string | null
          shareholder_type: string
          status: string
          units: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          joined_date?: string
          ownership_percent?: number
          phone?: string | null
          shareholder_type?: string
          status?: string
          units?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          joined_date?: string
          ownership_percent?: number
          phone?: string | null
          shareholder_type?: string
          status?: string
          units?: number
          updated_at?: string
          user_id?: string | null
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
      valuations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          methodology: string | null
          notes: string | null
          status: string
          total_valuation: number
          unit_price: number
          updated_at: string
          valuation_date: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          methodology?: string | null
          notes?: string | null
          status?: string
          total_valuation: number
          unit_price: number
          updated_at?: string
          valuation_date: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          methodology?: string | null
          notes?: string | null
          status?: string
          total_valuation?: number
          unit_price?: number
          updated_at?: string
          valuation_date?: string
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
      match_document_chunks: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          chunk_text: string
          document_id: string
          id: string
          page_number: number
          similarity: number
        }[]
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
