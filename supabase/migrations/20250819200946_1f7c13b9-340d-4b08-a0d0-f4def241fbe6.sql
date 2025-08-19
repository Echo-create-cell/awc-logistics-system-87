-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity
CREATE TYPE public.user_role AS ENUM ('admin', 'sales_director', 'sales_agent', 'finance_officer', 'partner');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive');
CREATE TYPE public.quotation_status AS ENUM ('won', 'lost', 'pending');
CREATE TYPE public.freight_mode AS ENUM ('Air Freight', 'Sea Freight', 'Road Freight');
CREATE TYPE public.request_type AS ENUM ('Import', 'Export', 'Re-Import', 'Project', 'Local');
CREATE TYPE public.invoice_status AS ENUM ('pending', 'paid', 'overdue');

-- Profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'sales_agent',
  status user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person TEXT,
  tin_number TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quotations table
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id),
  client_name TEXT,
  buy_rate DECIMAL(15,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  client_quote DECIMAL(15,2) DEFAULT 0,
  profit DECIMAL(15,2) DEFAULT 0,
  profit_percentage TEXT DEFAULT '0.0',
  quote_sent_by TEXT NOT NULL,
  status quotation_status NOT NULL DEFAULT 'pending',
  follow_up_date DATE,
  remarks TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  destination TEXT,
  door_delivery TEXT,
  freight_mode freight_mode,
  cargo_description TEXT,
  request_type request_type,
  country_of_origin TEXT,
  total_volume_kg DECIMAL(15,3) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quotation commodities table (for the volume JSON data)
CREATE TABLE public.quotation_commodities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity_kg DECIMAL(15,3) NOT NULL,
  rate DECIMAL(15,2) DEFAULT 0,
  client_rate DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  quotation_id UUID REFERENCES public.quotations(id),
  client_name TEXT NOT NULL,
  client_address TEXT,
  client_contact_person TEXT,
  client_tin TEXT,
  destination TEXT,
  door_delivery TEXT,
  salesperson TEXT,
  deliver_date DATE,
  payment_conditions TEXT,
  validity_date DATE,
  awb_number TEXT,
  sub_total DECIMAL(15,2) DEFAULT 0,
  tva DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status invoice_status NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoice items table
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  quantity_kg DECIMAL(15,3) NOT NULL,
  commodity TEXT NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoice charges table
CREATE TABLE public.invoice_charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_item_id UUID REFERENCES public.invoice_items(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  rate DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_charges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all clients" ON public.clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage clients" ON public.clients
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view all quotations" ON public.quotations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage quotations" ON public.quotations
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view quotation commodities" ON public.quotation_commodities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage quotation commodities" ON public.quotation_commodities
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view all invoices" ON public.invoices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage invoices" ON public.invoices
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view invoice items" ON public.invoice_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage invoice items" ON public.invoice_items
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view invoice charges" ON public.invoice_charges
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage invoice charges" ON public.invoice_charges
  FOR ALL TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX idx_quotations_created_by ON public.quotations(created_by);
CREATE INDEX idx_quotations_status ON public.quotations(status);
CREATE INDEX idx_quotations_created_at ON public.quotations(created_at);
CREATE INDEX idx_invoices_quotation_id ON public.invoices(quotation_id);
CREATE INDEX idx_invoices_created_by ON public.invoices(created_by);
CREATE INDEX idx_invoices_status ON public.invoices(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();