-- Delete invoice charges for invoices created in September 2025 (pre-import data)
DELETE FROM invoice_charges 
WHERE invoice_item_id IN (
    SELECT ii.id 
    FROM invoice_items ii 
    JOIN invoices i ON ii.invoice_id = i.id 
    WHERE i.created_at >= '2025-09-01' AND i.created_at < '2025-10-01'
);

-- Delete invoice items for invoices created in September 2025 (pre-import data)
DELETE FROM invoice_items 
WHERE invoice_id IN (
    SELECT id 
    FROM invoices 
    WHERE created_at >= '2025-09-01' AND created_at < '2025-10-01'
);

-- Delete invoices created in September 2025 (pre-import data)
DELETE FROM invoices 
WHERE created_at >= '2025-09-01' AND created_at < '2025-10-01';