-- Drop existing tables if they exist (for clean start)
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create quotations table with all required fields
CREATE TABLE quotations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id TEXT,
  client_name TEXT,
  volume TEXT NOT NULL DEFAULT '',
  buy_rate DECIMAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  client_quote DECIMAL DEFAULT 0,
  profit DECIMAL DEFAULT 0,
  profit_percentage TEXT DEFAULT '0%',
  quote_sent_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
  follow_up_date TEXT DEFAULT '',
  remarks TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by TEXT,
  approved_at TEXT,
  destination TEXT,
  door_delivery TEXT,
  linked_invoice_ids TEXT[],
  freight_mode TEXT CHECK (freight_mode IN ('Air Freight', 'Sea Freight', 'Road Freight')),
  cargo_description TEXT,
  request_type TEXT CHECK (request_type IN ('Import', 'Export', 'Re-Import', 'Project', 'Local')),
  country_of_origin TEXT,
  total_volume_kg DECIMAL
);

-- Create invoices table with all required fields
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  quotation_id TEXT,
  client_name TEXT NOT NULL,
  client_address TEXT NOT NULL,
  client_contact_person TEXT NOT NULL,
  client_tin TEXT NOT NULL,
  destination TEXT NOT NULL,
  door_delivery TEXT NOT NULL,
  salesperson TEXT NOT NULL,
  deliver_date TEXT NOT NULL,
  payment_conditions TEXT NOT NULL,
  validity_date TEXT NOT NULL,
  awb_number TEXT NOT NULL,
  items JSONB NOT NULL,
  sub_total DECIMAL NOT NULL,
  tva DECIMAL NOT NULL,
  total_amount DECIMAL NOT NULL,
  currency TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_created_at ON quotations(created_at);
CREATE INDEX idx_quotations_quote_sent_by ON quotations(quote_sent_by);

CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
CREATE INDEX idx_invoices_quotation_id ON invoices(quotation_id);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Enable Row Level Security
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (for now, allow all operations - adjust based on your auth needs)
CREATE POLICY "Allow all operations on quotations" ON quotations FOR ALL USING (true);
CREATE POLICY "Allow all operations on invoices" ON invoices FOR ALL USING (true);