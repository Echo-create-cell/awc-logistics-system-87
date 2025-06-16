
<?php
require_once '../includes/functions.php';
require_once '../config/database.php';

checkAuth();
// Allow multiple roles to view/print invoices
checkRole(['sales_agent', 'sales_director', 'admin', 'finance_officer']);

$database = new Database();
$conn = $database->getConnection();

if (!isset($_GET['id'])) {
    header('Location: invoices.php');
    exit();
}

// Get invoice details along with client info
$stmt = $conn->prepare("
    SELECT i.*, c.company_name, c.contact_person, c.address as client_address, c.city as client_city, 
           c.country as client_country, c.phone as client_phone, c.email as client_email, c.tin_number as client_tin
    FROM invoices i 
    JOIN clients c ON i.client_id = c.id 
    WHERE i.id = ?
");
$stmt->execute([$_GET['id']]);
$invoice = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$invoice) {
    header('Location: invoices.php');
    exit();
}

// Get invoice items
$stmt = $conn->prepare("SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id");
$stmt->execute([$_GET['id']]);
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get company settings
$stmt = $conn->prepare("SELECT * FROM company_settings WHERE id = 1");
$stmt->execute();
$company = $stmt->fetch(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice <?php echo htmlspecialchars($invoice['invoice_number']); ?> - AWC Logistics</title>
    <style>
        @media print {
            .no-print { display: none; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
        }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.4; color: #333; }
        .page { max-width: 800px; margin: 0 auto; padding: 30px; background: white; }
        .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #dc3545; padding-bottom: 15px; margin-bottom: 20px; }
        .company-info { flex: 2; }
        .invoice-info { flex: 1; text-align: right; }
        .logo { width: 100px; height: auto; margin-bottom: 10px; }
        h1, h2, h3 { margin: 0; }
        .invoice-info h1 { font-size: 36px; color: #dc3545; margin-bottom: 10px; }
        .info-item { margin-bottom: 3px; }
        .info-item strong { display: inline-block; width: 100px; }
        .client-info { margin-bottom: 30px; }
        .client-info p { margin: 2px 0; }
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .details-table th, .details-table td { border: 1px solid #333; padding: 6px; text-align: left; }
        .details-table th { background-color: #343a40 !important; color: white; font-weight: bold; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { border: 1px solid #ccc; padding: 6px; text-align: left; }
        .items-table th { background-color: #343a40 !important; color: white; font-weight: bold; }
        .items-table td.amount, .items-table th.amount { text-align: right; }
        .items-table tr:nth-child(even) { background-color: #f8f9fa !important; }
        .totals-section { display: flex; justify-content: flex-end; }
        .totals-table { width: 300px; }
        .totals-table td { padding: 6px; }
        .totals-table .label { font-weight: bold; }
        .totals-table .value { text-align: right; }
        .totals-table .grand-total { font-size: 16px; font-weight: bold; border-top: 2px solid #dc3545; }
        .footer { text-align: center; margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
        .signature-area { margin-bottom: 20px; }
        .signature-img { width: 150px; opacity: 0.8; }
        .footer h3 { font-size: 16px; margin-bottom: 10px; }
        .footer p { color: #dc3545; font-weight: bold; }
    </style>
</head>
<body>
    <div class="no-print" style="padding: 20px; background: #f0f0f0; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print Invoice</button>
        <a href="invoices.php" style="padding: 10px 20px; background: #6c757d; color: white; text-decoration: none; border-radius: 5px;">Back to Invoices</a>
    </div>

    <div class="page">
        <div class="invoice-header">
            <div class="company-info">
                <img src="/lovable-uploads/4ce8ac99-4c35-4cce-8481-cccc91145288.png" alt="AWC Logo" class="logo">
                <h2 style="font-weight: bold;"><?php echo htmlspecialchars($company['company_name']); ?> TIN: <?php echo htmlspecialchars($company['tin_number']); ?></h2>
                <p style="white-space: pre-line; margin: 5px 0;"><?php echo htmlspecialchars($company['address']); ?></p>
                <p><strong>Bank of Kigali</strong></p>
                <p style="white-space: pre-line; font-size: 10px;"><?php echo htmlspecialchars($company['bank_accounts']); ?></p>
                <p><strong>Swift code:</strong> <?php echo htmlspecialchars($company['swift_code']); ?></p>
                <p><strong>Phone Nr.:</strong> <?php echo htmlspecialchars($company['phone']); ?></p>
            </div>
            
            <div class="invoice-info">
                <h1>Invoice</h1>
                <div class="info-item"><strong>Nr. Of Invoice:</strong> <?php echo htmlspecialchars($invoice['invoice_number']); ?></div>
                <div class="info-item"><strong>Date:</strong> <?php echo date('d/m/Y', strtotime($invoice['issue_date'])); ?></div>
                <?php if (!empty($invoice['awb_number'])): ?>
                <div class="info-item" style="background: #e0f3ff; padding: 2px 5px; border: 1px solid #007bff;"><strong>AWB:</strong> <?php echo htmlspecialchars($invoice['awb_number']); ?></div>
                <?php endif; ?>
                <div class="info-item"><strong>Destination:</strong> <?php echo htmlspecialchars($invoice['destination']); ?></div>
                <div class="info-item"><strong>Door Delivery:</strong> <?php echo htmlspecialchars($invoice['door_delivery']); ?></div>
            </div>
        </div>

        <div class="client-info">
            <p><strong>Name of customer:</strong> <?php echo htmlspecialchars($invoice['company_name']); ?></p>
            <p><strong>Contact Person:</strong> <?php echo htmlspecialchars($invoice['contact_person']); ?></p>
            <p><strong>Address:</strong> <?php echo htmlspecialchars($invoice['client_address']); ?></p>
            <p><strong>Post code, Country:</strong> <?php echo htmlspecialchars($invoice['client_city'] . ', ' . $invoice['client_country']); ?></p>
            <?php if(!empty($invoice['client_tin'])): ?>
            <p><strong>TVA:</strong> <?php echo htmlspecialchars($invoice['client_tin']); ?></p>
            <?php endif; ?>
        </div>

        <table class="details-table">
            <thead>
                <tr>
                    <th>Salesperson</th>
                    <th>Deliver date</th>
                    <th>Payment conditions</th>
                    <th>Validity to Date</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><?php echo htmlspecialchars($invoice['salesperson']); ?></td>
                    <td><?php echo $invoice['deliver_date'] ? date('d/m/Y', strtotime($invoice['deliver_date'])) : 'N/A'; ?></td>
                    <td><?php echo htmlspecialchars($invoice['payment_conditions']); ?></td>
                    <td><?php echo $invoice['validity_date'] ? date('d/m/Y', strtotime($invoice['validity_date'])) : 'N/A'; ?></td>
                </tr>
            </tbody>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Quantity in kg</th>
                    <th>Commodity</th>
                    <th>Description</th>
                    <th class="amount">Price</th>
                    <th class="amount">Total Amount all incl./<?php echo htmlspecialchars($invoice['currency']); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php $itemCount = 0; ?>
                <?php foreach ($items as $item): $itemCount++; ?>
                <tr>
                    <td><?php echo $item['quantity_kg'] != 0 ? htmlspecialchars($item['quantity_kg']) : ''; ?></td>
                    <td><?php echo htmlspecialchars($item['commodity']); ?></td>
                    <td><?php echo htmlspecialchars($item['description']); ?></td>
                    <td class="amount"><?php echo $item['price'] != 0 ? number_format($item['price'], 2) : ''; ?></td>
                    <td class="amount"><?php echo number_format($item['total_amount'], 2); ?></td>
                </tr>
                <?php endforeach; ?>
                
                <?php for ($i = $itemCount; $i < 10; $i++): ?>
                <tr>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                </tr>
                <?php endfor; ?>
            </tbody>
        </table>

        <div class="totals-section">
            <table class="totals-table">
                <tbody>
                    <tr>
                        <td class="label">Sub-Total</td>
                        <td class="value"><?php echo number_format($invoice['sub_total'], 2); ?></td>
                    </tr>
                    <tr>
                        <td class="label">TVA</td>
                        <td class="value"><?php echo number_format($invoice['tva'], 2); ?></td>
                    </tr>
                    <tr class="grand-total">
                        <td class="label">TOTAL</td>
                        <td class="value"><?php echo number_format($invoice['total_amount'], 2); ?></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="footer">
            <div class="signature-area">
                <img src="/lovable-uploads/4ce8ac99-4c35-4cce-8481-cccc91145288.png" alt="AWC Signature" class="signature-img">
            </div>
            <h3>All checks are payable to <?php echo htmlspecialchars($company['company_name']); ?>.</h3>
            <p>WE THANK YOU FOR YOUR TRUST</p>
        </div>
    </div>
</body>
</html>
