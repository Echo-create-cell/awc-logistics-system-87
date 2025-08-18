import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      quotations: {
        Row: {
          id: string;
          client_name: string;
          destination: string;
          status: 'pending' | 'won' | 'lost';
          client_quote: number | null;
          quote_sent_by: string;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
          cargo_description: string | null;
          volume: string | null;
          remarks: string | null;
          linked_invoice_ids: string[] | null;
        };
        Insert: {
          id?: string;
          client_name: string;
          destination: string;
          status?: 'pending' | 'won' | 'lost';
          client_quote?: number | null;
          quote_sent_by: string;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
          cargo_description?: string | null;
          volume?: string | null;
          remarks?: string | null;
          linked_invoice_ids?: string[] | null;
        };
        Update: {
          id?: string;
          client_name?: string;
          destination?: string;
          status?: 'pending' | 'won' | 'lost';
          client_quote?: number | null;
          quote_sent_by?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
          cargo_description?: string | null;
          volume?: string | null;
          remarks?: string | null;
          linked_invoice_ids?: string[] | null;
        };
      };
      invoices: {
        Row: {
          id: string;
          quotation_id: string | null;
          client_name: string;
          client_address: string | null;
          client_email: string | null;
          client_phone: string | null;
          invoice_number: string;
          amount: number;
          tax_amount: number;
          total_amount: number;
          status: 'draft' | 'sent' | 'paid' | 'overdue';
          due_date: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          items: any;
        };
        Insert: {
          id?: string;
          quotation_id?: string | null;
          client_name: string;
          client_address?: string | null;
          client_email?: string | null;
          client_phone?: string | null;
          invoice_number: string;
          amount: number;
          tax_amount: number;
          total_amount: number;
          status?: 'draft' | 'sent' | 'paid' | 'overdue';
          due_date: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          items: any;
        };
        Update: {
          id?: string;
          quotation_id?: string | null;
          client_name?: string;
          client_address?: string | null;
          client_email?: string | null;
          client_phone?: string | null;
          invoice_number?: string;
          amount?: number;
          tax_amount?: number;
          total_amount?: number;
          status?: 'draft' | 'sent' | 'paid' | 'overdue';
          due_date?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          items?: any;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};