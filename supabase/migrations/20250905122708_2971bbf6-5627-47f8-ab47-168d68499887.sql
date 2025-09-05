-- Delete all invoice charges
DELETE FROM invoice_charges;

-- Delete all invoice items  
DELETE FROM invoice_items;

-- Delete all invoices
DELETE FROM invoices;

-- Delete all quotation commodities
DELETE FROM quotation_commodities;

-- Delete all quotations
DELETE FROM quotations;

-- Delete all clients
DELETE FROM clients;

-- Reset sequences/counters if any exist
-- This ensures clean slate for future data