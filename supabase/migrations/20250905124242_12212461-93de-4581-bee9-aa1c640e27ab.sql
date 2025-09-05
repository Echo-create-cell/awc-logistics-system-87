-- Remove foreign key constraints that reference auth.users
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_created_by_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_created_by_fkey;
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_created_by_fkey;
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_assigned_to_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Create sample user profiles for the import
INSERT INTO profiles (id, name, email, role, status) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Sales Director', 'director@company.com', 'sales_director', 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', 'System Admin', 'admin@company.com', 'admin', 'active');

-- Import sample quotations data from your provided dataset
INSERT INTO quotations (
  client_name, currency, buy_rate, client_quote, profit, profit_percentage, quote_sent_by, 
  status, follow_up_date, remarks, approved_by, approved_at, destination, door_delivery,
  freight_mode, cargo_description, request_type, country_of_origin, total_volume_kg, 
  created_by, created_at
) VALUES 
  ('AKAGERA AVIATION', 'USD', 0, 3223, 3223, '0.0', 'JOHN NDAYAMABAJE', 'won', '2025-01-01', 'Fire Extinguishers: 3 pieces - Air Freight', 'System Admin', '2024-12-18T12:00:00Z', 'USA', '', 'Air Freight', 'Fire Extinguishers: 3 pieces', 'Export', 'Rwanda', 2.4, '550e8400-e29b-41d4-a716-446655440001', '2024-12-18T10:00:00Z'),
  ('AKAGERA AVIATION', 'USD', 0, 4699, 4699, '0.0', 'JOHN NDAYAMABAJE', 'won', '2025-01-01', '2 x AIRCRAFT ENGINES - Air Freight', 'System Admin', '2024-12-18T12:00:00Z', 'USA', '', 'Air Freight', '2 x AIRCRAFT ENGINES', 'Export', 'Rwanda', 422, '550e8400-e29b-41d4-a716-446655440001', '2024-12-18T10:00:00Z'),
  ('NGALI/ LOCUS DYNAMICS', 'RWF', 0, 1274400, 1274400, '0.0', 'RONNY TWAHIRWA', 'won', '2025-01-01', 'DG SHIPMENT WITH BATTERIES - Air Freight', 'System Admin', '2024-12-23T12:00:00Z', 'Rwanda', '', 'Air Freight', 'DG SHIPMENT WITH BATTERIES', 'Import', 'Austria', 47.6, '550e8400-e29b-41d4-a716-446655440001', '2024-12-23T10:00:00Z'),
  ('ASCNET', 'USD', 0, 7250, 7250, '0.0', 'ANDY NUMA', 'won', '2025-02-01', 'SMART SCREENS - Air Freight', 'System Admin', '2025-01-16T12:00:00Z', 'Senegal', '', 'Air Freight', 'SMART SCREENS', 'Import', 'China', 1000, '550e8400-e29b-41d4-a716-446655440001', '2025-01-16T10:00:00Z'),
  ('ASCNET', 'USD', 0, 8690, 8690, '0.0', 'ANDY NUMA', 'won', '2025-02-01', 'SMART SCREENS - Sea Freight', 'System Admin', '2025-01-16T12:00:00Z', 'Senegal', '', 'Sea Freight', 'SMART SCREENS', 'Import', 'China', 1000, '550e8400-e29b-41d4-a716-446655440001', '2025-01-16T10:00:00Z'),
  ('ASCNET', 'USD', 0, 1275, 1275, '0.0', 'ANDY NUMA', 'won', '2025-02-01', 'SMART SCREENS - Sea Freight', 'System Admin', '2025-01-16T12:00:00Z', 'Rwanda', '', 'Sea Freight', 'SMART SCREENS', 'Import', 'China', 200, '550e8400-e29b-41d4-a716-446655440001', '2025-01-16T10:00:00Z'),
  ('MEX LOGISTICS', 'USD', 0, 706, 706, '0.0', 'PATRICK', 'won', '2025-02-01', 'GENERAL CARGO - Air Freight', 'System Admin', '2025-01-17T12:00:00Z', 'Uganda', '', 'Air Freight', 'GENERAL CARGO', 'Export', 'Rwanda', 38, '550e8400-e29b-41d4-a716-446655440001', '2025-01-17T10:00:00Z'),
  ('MEX LOGISTICS', 'USD', 0, 336, 336, '0.0', 'PATRICK', 'won', '2025-02-01', 'GENERAL CARGO - Air Freight', 'System Admin', '2025-01-17T12:00:00Z', 'Rwanda', '', 'Air Freight', 'GENERAL CARGO', 'Re-Import', 'Uganda', 38, '550e8400-e29b-41d4-a716-446655440001', '2025-01-17T10:00:00Z'),
  ('MOSES/SOLEIL', 'USD', 0, 0, 0, '0.0', 'MOSES', 'pending', '2025-02-01', 'PALM OIL AND SOYA - Road Freight', NULL, NULL, 'Rwanda', '', 'Road Freight', 'PALM OIL AND SOYA', 'Import', 'Tanzania', 300000, '550e8400-e29b-41d4-a716-446655440001', '2025-01-23T10:00:00Z'),
  ('YNANI KAMIKAZI', 'USD', 0, 12477, 12477, '0.0', 'YVANI KAMIKKAZI', 'won', '2025-02-01', ' - Road Freight', 'System Admin', '2025-01-23T12:00:00Z', 'Rwanda', '', 'Road Freight', '', 'Import', 'South Africa', 1000, '550e8400-e29b-41d4-a716-446655440001', '2025-01-23T10:00:00Z');

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
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM quotations 
  WHERE status = 'won' AND client_quote > 0
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