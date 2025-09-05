-- Clean up existing invoice data to avoid conflicts
DELETE FROM invoice_charges;
DELETE FROM invoice_items;
DELETE FROM invoices;

-- Delete existing quotation commodities to recreate them properly
DELETE FROM quotation_commodities;

-- Create commodities for the imported quotations
WITH quotation_data AS (
  SELECT 
    id,
    cargo_description,
    total_volume_kg,
    client_quote
  FROM quotations 
  WHERE total_volume_kg > 0
)
INSERT INTO quotation_commodities (quotation_id, name, quantity_kg, rate, client_rate)
SELECT 
  id,
  COALESCE(NULLIF(cargo_description, ''), 'General Cargo'),
  total_volume_kg,
  0,
  CASE WHEN total_volume_kg > 0 THEN client_quote / total_volume_kg ELSE 0 END
FROM quotation_data;

-- Create invoices for won quotations with client quotes > 0
WITH won_quotations AS (
  SELECT 
    id,
    client_name,
    destination,
    quote_sent_by,
    currency,
    client_quote,
    cargo_description,
    total_volume_kg,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM quotations 
  WHERE status = 'won' 
  AND client_quote > 0
)
INSERT INTO invoices (
  quotation_id, invoice_number, client_name, client_address, client_contact_person,
  client_tin, destination, door_delivery, salesperson, payment_conditions, awb_number,
  currency, tva, sub_total, total_amount, issue_date, due_date, deliver_date, 
  validity_date, status, created_by, created_at
)
SELECT 
  id,
  'INV-' || EXTRACT(YEAR FROM created_at) || '-' || LPAD(row_num::text, 4, '0'),
  client_name,
  '',
  '',
  '',
  destination,
  '',
  quote_sent_by,
  'Net 30 days',
  '',
  currency,
  0,
  client_quote,
  client_quote,
  created_at::date,
  (created_at::date + INTERVAL '30 days')::date,
  created_at::date,
  (created_at::date + INTERVAL '90 days')::date,
  'pending',
  '550e8400-e29b-41d4-a716-446655440001',
  created_at + INTERVAL '1 hour'
FROM won_quotations;

-- Create invoice items for each invoice
WITH invoice_data AS (
  SELECT 
    i.id as invoice_id,
    q.cargo_description,
    q.total_volume_kg,
    q.client_quote
  FROM invoices i
  JOIN quotations q ON i.quotation_id = q.id
  WHERE q.total_volume_kg > 0
)
INSERT INTO invoice_items (invoice_id, commodity, quantity_kg, total)
SELECT 
  invoice_id,
  COALESCE(NULLIF(cargo_description, ''), 'General Cargo'),
  total_volume_kg,
  client_quote
FROM invoice_data;