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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          contact_person: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          phone: string | null
          tin_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          tin_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          tin_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoice_charges: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_item_id: string | null
          rate: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_item_id?: string | null
          rate: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_item_id?: string | null
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_charges_invoice_item_id_fkey"
            columns: ["invoice_item_id"]
            isOneToOne: false
            referencedRelation: "invoice_items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          commodity: string
          created_at: string
          id: string
          invoice_id: string | null
          quantity_kg: number
          total: number
        }
        Insert: {
          commodity: string
          created_at?: string
          id?: string
          invoice_id?: string | null
          quantity_kg: number
          total: number
        }
        Update: {
          commodity?: string
          created_at?: string
          id?: string
          invoice_id?: string | null
          quantity_kg?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          awb_number: string | null
          client_address: string | null
          client_contact_person: string | null
          client_name: string
          client_tin: string | null
          created_at: string
          created_by: string | null
          currency: string
          deliver_date: string | null
          destination: string | null
          door_delivery: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          payment_conditions: string | null
          quotation_id: string | null
          salesperson: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          sub_total: number | null
          total_amount: number | null
          tva: number | null
          updated_at: string
          validity_date: string | null
        }
        Insert: {
          awb_number?: string | null
          client_address?: string | null
          client_contact_person?: string | null
          client_name: string
          client_tin?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deliver_date?: string | null
          destination?: string | null
          door_delivery?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          payment_conditions?: string | null
          quotation_id?: string | null
          salesperson?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          sub_total?: number | null
          total_amount?: number | null
          tva?: number | null
          updated_at?: string
          validity_date?: string | null
        }
        Update: {
          awb_number?: string | null
          client_address?: string | null
          client_contact_person?: string | null
          client_name?: string
          client_tin?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deliver_date?: string | null
          destination?: string | null
          door_delivery?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          payment_conditions?: string | null
          quotation_id?: string | null
          salesperson?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          sub_total?: number | null
          total_amount?: number | null
          tva?: number | null
          updated_at?: string
          validity_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      quotation_commodities: {
        Row: {
          client_rate: number | null
          created_at: string
          id: string
          name: string
          quantity_kg: number
          quotation_id: string | null
          rate: number | null
        }
        Insert: {
          client_rate?: number | null
          created_at?: string
          id?: string
          name: string
          quantity_kg: number
          quotation_id?: string | null
          rate?: number | null
        }
        Update: {
          client_rate?: number | null
          created_at?: string
          id?: string
          name?: string
          quantity_kg?: number
          quotation_id?: string | null
          rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_commodities_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          buy_rate: number | null
          cargo_description: string | null
          client_id: string | null
          client_name: string | null
          client_quote: number | null
          country_of_origin: string | null
          created_at: string
          created_by: string | null
          currency: string
          destination: string | null
          door_delivery: string | null
          follow_up_date: string | null
          freight_mode: Database["public"]["Enums"]["freight_mode"] | null
          id: string
          profit: number | null
          profit_percentage: string | null
          quote_sent_by: string
          remarks: string | null
          request_type: Database["public"]["Enums"]["request_type"] | null
          status: Database["public"]["Enums"]["quotation_status"]
          total_volume_kg: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          buy_rate?: number | null
          cargo_description?: string | null
          client_id?: string | null
          client_name?: string | null
          client_quote?: number | null
          country_of_origin?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          destination?: string | null
          door_delivery?: string | null
          follow_up_date?: string | null
          freight_mode?: Database["public"]["Enums"]["freight_mode"] | null
          id?: string
          profit?: number | null
          profit_percentage?: string | null
          quote_sent_by: string
          remarks?: string | null
          request_type?: Database["public"]["Enums"]["request_type"] | null
          status?: Database["public"]["Enums"]["quotation_status"]
          total_volume_kg?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          buy_rate?: number | null
          cargo_description?: string | null
          client_id?: string | null
          client_name?: string | null
          client_quote?: number | null
          country_of_origin?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          destination?: string | null
          door_delivery?: string | null
          follow_up_date?: string | null
          freight_mode?: Database["public"]["Enums"]["freight_mode"] | null
          id?: string
          profit?: number | null
          profit_percentage?: string | null
          quote_sent_by?: string
          remarks?: string | null
          request_type?: Database["public"]["Enums"]["request_type"] | null
          status?: Database["public"]["Enums"]["quotation_status"]
          total_volume_kg?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      freight_mode: "Air Freight" | "Sea Freight" | "Road Freight"
      invoice_status: "pending" | "paid" | "overdue"
      quotation_status: "won" | "lost" | "pending"
      request_type: "Import" | "Export" | "Re-Import" | "Project" | "Local"
      user_role:
        | "admin"
        | "sales_director"
        | "sales_agent"
        | "finance_officer"
        | "partner"
      user_status: "active" | "inactive"
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
      freight_mode: ["Air Freight", "Sea Freight", "Road Freight"],
      invoice_status: ["pending", "paid", "overdue"],
      quotation_status: ["won", "lost", "pending"],
      request_type: ["Import", "Export", "Re-Import", "Project", "Local"],
      user_role: [
        "admin",
        "sales_director",
        "sales_agent",
        "finance_officer",
        "partner",
      ],
      user_status: ["active", "inactive"],
    },
  },
} as const
