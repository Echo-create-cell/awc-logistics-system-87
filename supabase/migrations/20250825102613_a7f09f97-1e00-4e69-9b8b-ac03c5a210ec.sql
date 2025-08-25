-- Insert sample quotations data to ensure permanent storage (without created_by foreign key constraint)
INSERT INTO quotations (
  client_name,
  destination,
  cargo_description,
  country_of_origin,
  freight_mode,
  request_type,
  door_delivery,
  currency,
  buy_rate,
  client_quote,
  profit,
  profit_percentage,
  total_volume_kg,
  quote_sent_by,
  remarks,
  status,
  created_at
) VALUES 
(
  'AFRICA WORLD CARGO',
  'CAMEROON',
  'GENERAL CARGO',
  'KENYA',
  'Air Freight',
  'Import',
  'YES',
  'USD',
  2.5,
  3.5,
  1.0,
  '40.0',
  1000.0,
  'N. SOLANGE',
  'Sample quotation for testing',
  'pending',
  now()
),
(
  'TEST CLIENT LTD',
  'UGANDA',
  'ELECTRONICS',
  'CHINA',
  'Air Freight',
  'Import',
  'NO',
  'USD',
  3.0,
  4.2,
  1.2,
  '40.0',
  500.0,
  'I. ARNOLD',
  'Electronics shipment',
  'pending',
  now()
);

-- Also insert corresponding commodities for the quotations
INSERT INTO quotation_commodities (
  quotation_id,
  name,
  quantity_kg,
  rate,
  client_rate
) 
SELECT 
  q.id,
  'General Cargo',
  500.0,
  2.5,
  3.5
FROM quotations q 
WHERE q.client_name = 'AFRICA WORLD CARGO' 
AND q.destination = 'CAMEROON'
AND NOT EXISTS (
  SELECT 1 FROM quotation_commodities qc WHERE qc.quotation_id = q.id
);

INSERT INTO quotation_commodities (
  quotation_id,
  name,
  quantity_kg,
  rate,
  client_rate
) 
SELECT 
  q.id,
  'Electronics',
  500.0,
  3.0,
  4.2
FROM quotations q 
WHERE q.client_name = 'TEST CLIENT LTD' 
AND q.destination = 'UGANDA'
AND NOT EXISTS (
  SELECT 1 FROM quotation_commodities qc WHERE qc.quotation_id = q.id
);