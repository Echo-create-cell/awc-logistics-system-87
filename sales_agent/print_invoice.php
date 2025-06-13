
<?php
require_once '../includes/functions.php';
require_once '../config/database.php';

checkAuth();
checkRole(['sales_agent', 'admin']);

$database = new Database();
$conn = $database->getConnection();

if (!isset($_GET['id'])) {
    header('Location: invoices.php');
    exit();
}

// Get invoice details
$stmt = $conn->prepare("
    SELECT i.*, c.company_name, c.contact_person, c.address, c.city, c.country, c.phone, c.email, c.tin_number
    FROM invoices i 
    JOIN clients c ON i.client_id = c.id 
    WHERE i.id = ?
");
$stmt->execute([$_GET['id']]);
$invoice = $stmt->fetch();

if (!$invoice) {
    header('Location: invoices.php');
    exit();
}

// Get invoice items
$stmt = $conn->prepare("SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id");
$stmt->execute([$_GET['id']]);
$items = $stmt->fetchAll();

// Get company settings
$stmt = $conn->prepare("SELECT * FROM company_settings WHERE id = 1");
$stmt->execute();
$company = $stmt->fetch();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice <?php echo $invoice['invoice_number']; ?> - AWC Logistics</title>
    <style>
        @media print {
            .no-print { display: none; }
            body { margin: 0; }
        }
        body { font-family: Arial, sans-serif; font-size: 12px; }
        .invoice-header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .company-info { float: left; width: 60%; }
        .invoice-info { float: right; width: 35%; text-align: right; }
        .client-info { margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        .items-table th { background-color: #f5f5f5; font-weight: bold; }
        .totals { float: right; width: 300px; margin-top: 20px; }
        .totals table { width: 100%; }
        .totals td { padding: 5px; }
        .total-row { font-weight: bold; font-size: 14px; }
        .signature-section { margin-top: 50px; text-align: center; }
        .clearfix::after { content: ""; display: table; clear: both; }
        .logo { width: 80px; height: auto; }
    </style>
</head>
<body>
    <div class="no-print" style="padding: 20px; background: #f5f5f5; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 5px; margin-right: 10px;">Print Invoice</button>
        <a href="invoices.php" style="padding: 10px 20px; background: #6c757d; color: white; text-decoration: none; border-radius: 5px;">Back to Invoices</a>
    </div>

    <div style="max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
        <!-- Invoice Header -->
        <div class="invoice-header clearfix">
            <div class="company-info">
                <div style="display: flex; align-items: center;">
                    <img src="/lovable-uploads/4ce8ac99-4c35-4cce-8481-cccc91145288.png" alt="AWC Logo" class="logo" style="margin-right: 15px;">
                    <div>
                        <h2 style="margin: 0; color: #007cba;"><?php echo $company['company_name']; ?></h2>
                        <p style="margin: 0; font-size: 11px;"><?php echo $company['tin_number']; ?></p>
                    </div>
                </div>
                <div style="margin-top: 10px;">
                    <p style="margin: 2px 0;"><?php echo nl2br($company['address']); ?></p>
                    <p style="margin: 2px 0;"><?php echo $company['bank_name']; ?></p>
                    <p style="margin: 2px 0; font-size: 10px;"><?php echo nl2br($company['bank_accounts']); ?></p>
                    <p style="margin: 2px 0;">Swift code: <?php echo $company['swift_code']; ?></p>
                    <p style="margin: 2px 0;">Phone Nr.: <?php echo $company['phone']; ?></p>
                </div>
            </div>
            
            <div class="invoice-info">
                <h1 style="margin: 0; color: #dc3545; font-size: 36px;">Invoice <?php echo substr($invoice['invoice_number'], -1); ?></h1>
                <p style="margin: 5px 0;"><strong>Nr. Of Invoice:</strong> <?php echo $invoice['invoice_number']; ?></p>
                <p style="margin: 5px 0;"><strong>Date:</strong> <?php echo date('d/m/Y', strtotime($invoice['issue_date'])); ?></p>
                <p style="margin: 5px 0;"><strong>AWB:</strong> <?php echo $invoice['awb_number']; ?></p>
                <p style="margin: 5px 0;"><strong>Destination:</strong> <?php echo $invoice['client']['city'] ?? ''; ?>-<?php echo $invoice['client']['country'] ?? ''; ?></p>
                <p style="margin: 5px 0;"><strong>Door Delivery:</strong> <?php echo $invoice['client']['city'] ?? ''; ?> ICD</p>
            </div>
        </div>

        <!-- Client Info -->
        <div class="client-info clearfix">
            <p><strong>Name of customer:</strong> <?php echo $invoice['company_name']; ?></p>
            <p><strong>Contact Person:</strong> <?php echo $invoice['contact_person']; ?></p>
            <p><strong>Address:</strong></p>
            <p><strong>Post code, Country:</strong></p>
            <p style="text-align: right; margin-top: 20px;"><strong>TVA:</strong></p>
        </div>

        <!-- Invoice Details -->
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr style="background-color: #6c757d; color: white;">
                <td style="padding: 8px; border: 1px solid #000;"><strong>Salesperson</strong></td>
                <td style="padding: 8px; border: 1px solid #000;"><strong>Deliver date</strong></td>
                <td style="padding: 8px; border: 1px solid #000;"><strong>Payment conditions</strong></td>
                <td style="padding: 8px; border: 1px solid #000;"><strong>Validity to Date</strong></td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #000;"><?php echo $invoice['salesperson']; ?></td>
                <td style="padding: 8px; border: 1px solid #000;"><?php echo $invoice['deliver_date'] ? date('d/m/Y', strtotime($invoice['deliver_date'])) : ''; ?></td>
                <td style="padding: 8px; border: 1px solid #000;"><?php echo $invoice['payment_conditions']; ?></td>
                <td style="padding: 8px; border: 1px solid #000;"><?php echo $invoice['validity_date'] ? date('d/m/Y', strtotime($invoice['validity_date'])) : ''; ?></td>
            </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr style="background-color: #6c757d; color: white;">
                    <th>Quantity in kg</th>
                    <th>Commodity</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Total Amount all incl./USD</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($items as $item): ?>
                <tr style="background-color: <?php echo ($item['id'] % 2 == 0) ? '#f8f9fa' : 'white'; ?>;">
                    <td><?php echo $item['quantity_kg']; ?></td>
                    <td><?php echo $item['commodity']; ?></td>
                    <td><?php echo $item['description']; ?></td>
                    <td><?php echo number_format($item['price'], 2); ?></td>
                    <td style="text-align: right;"><?php echo number_format($item['total_amount'], 2); ?></td>
                </tr>
                <?php endforeach; ?>
                
                <!-- Add empty rows to match the invoice format -->
                <?php for ($i = count($items); $i < 8; $i++): ?>
                <tr style="background-color: <?php echo ($i % 2 == 0) ? '#f8f9fa' : 'white'; ?>;">
                    <td>0</td>
                    <td></td>
                    <td></td>
                    <td>0.00</td>
                    <td style="text-align: right;">0.00</td>
                </tr>
                <?php endfor; ?>
            </tbody>
        </table>

        <!-- Totals -->
        <div style="text-align: right; margin-top: 30px;">
            <table style="float: right; width: 300px;">
                <tr>
                    <td style="padding: 5px; border-bottom: 1px solid #007cba;"><strong>Sub-Total</strong></td>
                    <td style="padding: 5px; text-align: right; border-bottom: 1px solid #007cba;"><?php echo number_format($invoice['sub_total'], 2); ?></td>
                </tr>
                <tr>
                    <td style="padding: 5px;"><strong>TVA</strong></td>
                    <td style="padding: 5px; text-align: right;"><?php echo number_format($invoice['tva'], 2); ?></td>
                </tr>
                <tr style="border-top: 2px solid #007cba;">
                    <td style="padding: 8px; font-size: 16px;"><strong>TOTAL</strong></td>
                    <td style="padding: 8px; text-align: right; font-size: 16px;"><strong><?php echo number_format($invoice['total_amount'], 2); ?></strong></td>
                </tr>
            </table>
        </div>

        <div class="clearfix"></div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div style="margin: 50px 0;">
                <img src="/lovable-uploads/4ce8ac99-4c35-4cce-8481-cccc91145288.png" alt="AWC Signature" style="width: 150px; opacity: 0.7;">
            </div>
            <h3 style="margin: 20px 0; font-size: 18px;">All checks are payable to Africa World Cargo Ltd.</h3>
            <p style="color: #dc3545; font-weight: bold; margin-top: 30px;">WE THANK YOU FOR YOUR TRUST</p>
        </div>
    </div>
</body>
</html>
