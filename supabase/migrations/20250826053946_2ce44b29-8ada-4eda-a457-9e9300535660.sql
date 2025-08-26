-- Insert sample quotation data from the uploaded spreadsheet
-- This data will help test the save quotation functionality

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
  follow_up_date,
  created_at
) VALUES 
-- AKAGERA AVIATION entries
('AKAGERA AVIATION', 'USA', 'Fire Extinguishers 3 pieces', 'RWANDA', 'Air Freight', 'Export', 'YES', 'USD', 0, 3223.00, 3223.00, '100.0', 24.0, 'JOHN NDAYAMBAJE', 'Airfreight', 'won', '2024-12-20', '2024-12-18 00:00:00'),
('AKAGERA AVIATION', 'USA', '1 x AIRCRAFT ENGINES', 'RWANDA', 'Air Freight', 'Export', 'YES', 'USD', 0, 4899.00, 4899.00, '100.0', 422.0, 'JOHN NDAYAMBAJE', 'Airfreight', 'won', '2024-12-20', '2024-12-18 00:00:00'),
('MGALI/ LOCUS DYMANICS', 'UGANDA', '4x x AIRCRAFT ENGINES', 'AUSTRIA', 'Air Freight', 'Import', 'YES', 'RWF', 1274200.00, 1274200.00, 0, '0.0', 47.0, 'RONNY TWAHIRWA', 'Airfreight', 'won', '2024-12-20', '2024-12-19 00:00:00'),

-- ASCNET entries
('ASCNET', 'SENEGAL', 'SMART SCREENS', 'CHINA', 'Air Freight', 'Import', 'YES', 'USD', 0, 7250.00, 7250.00, '100.0', 20.0, 'ANDY NUMA', 'Still in negociations', 'pending', '2025-01-20', '2025-01-16 00:00:00'),
('ASCNET', 'SENEGAL', 'SMART SCREENS', 'CHINA', 'Sea Freight', 'Import', 'YES', 'USD', 0, 8690.00, 8690.00, '100.0', 20.0, 'ANDY NUMA', 'Still in negociations', 'pending', '2025-01-20', '2025-01-16 00:00:00'),
('ASCNET', 'RWANDA', 'SMART SCREENS', 'CHINA', 'Sea Freight', 'Import', 'YES', 'USD', 0, 3024.00, 3024.00, '100.0', 200.0, 'ANDY NUMA', 'Still in negociations', 'pending', '2025-01-20', '2025-01-16 00:00:00'),

-- MFX LOGISTICS entries
('MFX LOGISTICS', 'RWANDA', 'GENERAL CARGO', 'RWANDA', 'Air Freight', 'Export', 'YES', 'USD', 0, 706.00, 706.00, '100.0', 38.0, 'PATRICK', 'Still in negociations', 'pending', '2025-01-20', '2025-01-17 00:00:00'),
('MFX LOGISTICS', 'RWANDA', 'GENERAL CARGO', 'UGANDA', 'Air Freight', 'Re-Import', 'YES', 'USD', 0, 336.00, 336.00, '100.0', 38.0, 'PATRICK', 'Still in negociations', 'pending', '2025-01-20', '2025-01-17 00:00:00'),
('MKOSIKOLI', 'RWANDA', 'PALM OIL AND SOYA', 'TANZANIA', 'Road Freight', 'Import', 'YES', 'USD', 0, 0, 0, '0.0', 30.0, 'JACQUES', 'Still in negociations', 'pending', '2025-01-25', '2025-01-23 00:00:00'),

-- Other entries
('YYNANI KAMIKAZI', 'RWANDA', '', 'SOUTH AFRICA', 'Road Freight', 'Import', 'YES', 'USD', 0, 12477.00, 12477.00, '100.0', 0, 'YYNANI KAMIKAZI', 'Client used others', 'lost', '2025-01-30', '2025-01-23 00:00:00'),
('POWELL SYSTEMS', 'RWANDA', '', 'TURKEY', 'Air Freight', 'Import', 'YES', 'USD', 0, 0, 0, '0.0', 0, 'PATSON MARIMWE', 'Still in negociations', 'pending', '2025-01-30', '2025-01-23 00:00:00'),

-- MGALI/ LOCUS DYNAMICS entries
('MGALI/ LOCUS DYNAMICS', 'RWANDA', 'SHIPMENT WITH GENERAL CARGO AND OG', 'AUSTRIA', 'Air Freight', 'Import', 'YES', 'EUR', 2050.00, 2050.00, 0, '0.0', 8.1, 'RONNY TWAHIRWA', 'Airfreight/ Waiting shipment collections', 'won', '2025-02-05', '2025-02-04 00:00:00'),
('MGALI/ LOCUS DYNAMICS', 'RWANDA', 'FINISHED BIRCH AND SKU', 'USA', 'Air Freight', 'Import', 'YES', 'USD', 0, 2450.00, 2450.00, '100.0', 1.36, 'RONNY TWAHIRWA', 'Still in negociations', 'pending', '2025-02-10', '2025-02-06 00:00:00'),

-- REMOTE GROUP and MFX LOGISTICS entries
('REMOTE GROUP', 'RWANDA', 'WATER PIPE', 'TANZANIA/ KENYA', 'Road Freight', 'Project', 'YES', 'USD', 0, 0, 0, '0.0', 0, '', 'Still in negociations', 'pending', '2025-02-15', '2025-02-07 00:00:00'),
('MFX LOGISTICS', 'GOMA', 'GENERAL CARGO', 'TANZANIA', 'Road Freight', 'Local', 'YES', 'USD', 0, 2250.00, 2250.00, '100.0', 15.0, 'Herbert Akira', 'Still in negociations', 'pending', '2025-02-15', '2025-02-10 00:00:00'),

-- Michel M. TSHIKALA entries
('Michel M. TSHIKALA', 'RWANDA', 'TENT KITS, BOXES OF MASKS', 'SENEGAL', 'Air Freight', 'Import', 'YES', 'USD', 0, 1708.00, 1708.00, '100.0', 113.1, 'Michel M. TSHIKALA', 'Airfreight transit to Kigali', 'won', '2025-02-15', '2025-02-13 00:00:00'),
('Michel M. TSHIKALA', 'GOMA', '', 'KINSHASA', 'Air Freight', 'Import', 'YES', 'USD', 0, 0, 0, '0.0', 100.0, 'Michel M. TSHIKALA', 'Airfreight/ Transit to Goma', 'won', '2025-02-15', '2025-02-14 00:00:00'),
('Michel M. TSHIKALA', 'GOMA', '', 'KINSHASA', 'Air Freight', 'Import', 'YES', 'USD', 0, 0, 0, '0.0', 29.0, 'Michel M. TSHIKALA', 'Airfreight/ Transit to Goma', 'won', '2025-02-15', '2025-02-14 00:00:00');

-- Insert corresponding commodities for each quotation
INSERT INTO quotation_commodities (
  quotation_id,
  name,
  quantity_kg,
  rate,
  client_rate
)
SELECT 
  q.id,
  COALESCE(q.cargo_description, 'General Cargo'),
  q.total_volume_kg,
  q.buy_rate,
  CASE WHEN q.total_volume_kg > 0 THEN q.client_quote / q.total_volume_kg ELSE q.client_quote END
FROM quotations q
WHERE q.created_at >= now() - interval '1 minute'
AND NOT EXISTS (
  SELECT 1 FROM quotation_commodities qc WHERE qc.quotation_id = q.id
);