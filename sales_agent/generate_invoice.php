
<?php
require_once '../includes/functions.php';
require_once '../config/database.php';

checkAuth();
checkRole(['sales_agent']);

$database = new Database();
$conn = $database->getConnection();

// Get quotation details if quotation_id is provided
$quotation = null;
if (isset($_GET['quotation_id'])) {
    $stmt = $conn->prepare("
        SELECT q.*, c.company_name, c.contact_person, c.address, c.city, c.country, c.phone, c.email 
        FROM quotations q 
        LEFT JOIN clients c ON q.client_id = c.id 
        WHERE q.id = ? AND q.status = 'approved'
    ");
    $stmt->execute([$_GET['quotation_id']]);
    $quotation = $stmt->fetch();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    try {
        $conn->beginTransaction();

        // Generate invoice number
        $invoice_number = 'INV-' . date('Y') . '-' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        
        // Calculate totals
        $sub_total = 0;
        $items = $_POST['items'];
        
        foreach ($items as $item) {
            if (!empty($item['total_amount'])) {
                $sub_total += floatval($item['total_amount']);
            }
        }
        
        $tva = floatval($_POST['tva']) ?? 0;
        $total_amount = $sub_total + $tva;

        // Insert invoice
        $stmt = $conn->prepare("
            INSERT INTO invoices (quotation_id, invoice_number, client_id, salesperson, deliver_date, 
                                payment_conditions, validity_date, awb_number, sub_total, tva, 
                                total_amount, currency, issue_date, due_date, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $_POST['quotation_id'],
            $invoice_number,
            $_POST['client_id'],
            $_POST['salesperson'],
            $_POST['deliver_date'],
            $_POST['payment_conditions'],
            $_POST['validity_date'],
            $_POST['awb_number'],
            $sub_total,
            $tva,
            $total_amount,
            $_POST['currency'],
            $_POST['issue_date'],
            $_POST['due_date'],
            $_SESSION['user_id']
        ]);

        $invoice_id = $conn->lastInsertId();

        // Insert invoice items
        $stmt = $conn->prepare("
            INSERT INTO invoice_items (invoice_id, quantity_kg, commodity, description, price, total_amount) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        foreach ($items as $item) {
            if (!empty($item['description']) || !empty($item['total_amount'])) {
                $stmt->execute([
                    $invoice_id,
                    floatval($item['quantity_kg']) ?? 0,
                    $item['commodity'] ?? '',
                    $item['description'] ?? '',
                    floatval($item['price']) ?? 0,
                    floatval($item['total_amount']) ?? 0
                ]);
            }
        }

        $conn->commit();
        $success = "Invoice #{$invoice_number} created successfully!";
        
        // Redirect to print invoice
        header("Location: print_invoice.php?id={$invoice_id}");
        exit();
        
    } catch (Exception $e) {
        $conn->rollBack();
        $error = "Failed to create invoice: " . $e->getMessage();
    }
}

// Get company settings
$stmt = $conn->prepare("SELECT * FROM company_settings WHERE id = 1");
$stmt->execute();
$company = $stmt->fetch();

// Get clients for dropdown
$stmt = $conn->prepare("SELECT * FROM clients ORDER BY company_name");
$stmt->execute();
$clients = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generate Invoice - AWC Logistics</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="flex">
        <!-- Sidebar -->
        <div class="bg-slate-900 text-white w-64 min-h-screen p-4">
            <div class="mb-8">
                <h1 class="text-xl font-bold text-blue-400">AWC Logistics</h1>
                <p class="text-sm text-slate-400">Sales Agent</p>
            </div>
            
            <nav class="space-y-2">
                <a href="index.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>Dashboard</span>
                </a>
                <a href="approved_quotations.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>Approved Quotations</span>
                </a>
                <a href="invoices.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>Invoices</span>
                </a>
                <a href="generate_invoice.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 text-white">
                    <span>Generate Invoice</span>
                </a>
                <a href="../auth/logout.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>Logout</span>
                </a>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1 p-8">
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-800">Generate Invoice</h2>
                <p class="text-gray-600">Create a new invoice from approved quotation</p>
            </div>

            <?php if (isset($success)): ?>
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    <?php echo $success; ?>
                </div>
            <?php endif; ?>

            <?php if (isset($error)): ?>
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <?php echo $error; ?>
                </div>
            <?php endif; ?>

            <div class="bg-white rounded-lg shadow p-6">
                <form method="POST" id="invoiceForm">
                    <!-- Invoice Header -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Quotation ID</label>
                            <input type="number" name="quotation_id" value="<?php echo $quotation['id'] ?? ''; ?>" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Client</label>
                            <select name="client_id" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                                <option value="">Select Client</option>
                                <?php foreach ($clients as $client): ?>
                                <option value="<?php echo $client['id']; ?>" <?php echo ($quotation && $quotation['client_id'] == $client['id']) ? 'selected' : ''; ?>>
                                    <?php echo $client['company_name']; ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Issue Date</label>
                            <input type="date" name="issue_date" value="<?php echo date('Y-m-d'); ?>" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Salesperson</label>
                            <input type="text" name="salesperson" value="<?php echo $_SESSION['user_name']; ?>" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Delivery Date</label>
                            <input type="date" name="deliver_date" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Validity Date</label>
                            <input type="date" name="validity_date" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Payment Conditions</label>
                            <input type="text" name="payment_conditions" value="Transfer at Bank" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">AWB Number</label>
                            <input type="text" name="awb_number" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Currency</label>
                            <select name="currency" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                                <option value="USD" <?php echo ($quotation && $quotation['currency'] == 'USD') ? 'selected' : ''; ?>>USD</option>
                                <option value="EUR" <?php echo ($quotation && $quotation['currency'] == 'EUR') ? 'selected' : ''; ?>>EUR</option>
                                <option value="RWF" <?php echo ($quotation && $quotation['currency'] == 'RWF') ? 'selected' : ''; ?>>RWF</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
                            <input type="date" name="due_date" value="<?php echo date('Y-m-d', strtotime('+30 days')); ?>" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        </div>
                    </div>

                    <!-- Invoice Items -->
                    <div class="mb-8">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-800">Invoice Items</h3>
                            <button type="button" onclick="addInvoiceItem()" 
                                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                Add Item
                            </button>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full border border-gray-300">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-2 border-b text-left">Quantity (kg)</th>
                                        <th class="px-4 py-2 border-b text-left">Commodity</th>
                                        <th class="px-4 py-2 border-b text-left">Description</th>
                                        <th class="px-4 py-2 border-b text-left">Price</th>
                                        <th class="px-4 py-2 border-b text-left">Total Amount</th>
                                        <th class="px-4 py-2 border-b text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="invoice-items">
                                    <!-- Default rows -->
                                    <tr class="invoice-item-row">
                                        <td class="px-4 py-2 border-b">
                                            <input type="number" step="0.01" name="items[0][quantity_kg]" 
                                                   class="w-full px-2 py-1 border rounded">
                                        </td>
                                        <td class="px-4 py-2 border-b">
                                            <input type="text" name="items[0][commodity]" 
                                                   class="w-full px-2 py-1 border rounded">
                                        </td>
                                        <td class="px-4 py-2 border-b">
                                            <input type="text" name="items[0][description]" placeholder="Transit Bond"
                                                   class="w-full px-2 py-1 border rounded">
                                        </td>
                                        <td class="px-4 py-2 border-b">
                                            <input type="number" step="0.01" name="items[0][price]" 
                                                   onchange="calculateItemTotal(0)"
                                                   class="w-full px-2 py-1 border rounded">
                                        </td>
                                        <td class="px-4 py-2 border-b">
                                            <input type="number" step="0.01" name="items[0][total_amount]" 
                                                   onchange="calculateSubTotal()"
                                                   class="w-full px-2 py-1 border rounded">
                                        </td>
                                        <td class="px-4 py-2 border-b">
                                            <button type="button" onclick="removeInvoiceItem(this)" 
                                                    class="text-red-600 hover:text-red-800">Remove</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Invoice Totals -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div></div>
                        <div class="space-y-4">
                            <div class="flex justify-between">
                                <label class="font-semibold">Sub-Total:</label>
                                <input type="number" step="0.01" name="sub_total" id="sub_total" readonly 
                                       class="px-2 py-1 border rounded bg-gray-100 text-right w-32">
                            </div>
                            <div class="flex justify-between">
                                <label class="font-semibold">TVA:</label>
                                <input type="number" step="0.01" name="tva" id="tva" value="0" 
                                       onchange="calculateTotal()"
                                       class="px-2 py-1 border rounded text-right w-32">
                            </div>
                            <div class="flex justify-between text-lg font-bold">
                                <label>TOTAL:</label>
                                <input type="number" step="0.01" name="total" id="total" readonly 
                                       class="px-2 py-1 border rounded bg-gray-100 text-right w-32 font-bold">
                            </div>
                        </div>
                    </div>

                    <div class="flex space-x-4">
                        <button type="submit" 
                                class="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition duration-200">
                            Generate Invoice
                        </button>
                        <a href="invoices.php" 
                           class="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition duration-200">
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        let itemCount = 1;

        function addInvoiceItem() {
            const tbody = document.getElementById('invoice-items');
            const newRow = document.createElement('tr');
            newRow.className = 'invoice-item-row';
            newRow.innerHTML = `
                <td class="px-4 py-2 border-b">
                    <input type="number" step="0.01" name="items[${itemCount}][quantity_kg]" 
                           class="w-full px-2 py-1 border rounded">
                </td>
                <td class="px-4 py-2 border-b">
                    <input type="text" name="items[${itemCount}][commodity]" 
                           class="w-full px-2 py-1 border rounded">
                </td>
                <td class="px-4 py-2 border-b">
                    <input type="text" name="items[${itemCount}][description]" 
                           class="w-full px-2 py-1 border rounded">
                </td>
                <td class="px-4 py-2 border-b">
                    <input type="number" step="0.01" name="items[${itemCount}][price]" 
                           onchange="calculateItemTotal(${itemCount})"
                           class="w-full px-2 py-1 border rounded">
                </td>
                <td class="px-4 py-2 border-b">
                    <input type="number" step="0.01" name="items[${itemCount}][total_amount]" 
                           onchange="calculateSubTotal()"
                           class="w-full px-2 py-1 border rounded">
                </td>
                <td class="px-4 py-2 border-b">
                    <button type="button" onclick="removeInvoiceItem(this)" 
                            class="text-red-600 hover:text-red-800">Remove</button>
                </td>
            `;
            tbody.appendChild(newRow);
            itemCount++;
        }

        function removeInvoiceItem(button) {
            const row = button.closest('tr');
            row.remove();
            calculateSubTotal();
        }

        function calculateItemTotal(index) {
            const quantity = parseFloat(document.querySelector(`input[name="items[${index}][quantity_kg]"]`).value) || 0;
            const price = parseFloat(document.querySelector(`input[name="items[${index}][price]"]`).value) || 0;
            const total = quantity * price;
            document.querySelector(`input[name="items[${index}][total_amount]"]`).value = total.toFixed(2);
            calculateSubTotal();
        }

        function calculateSubTotal() {
            let subTotal = 0;
            const totalInputs = document.querySelectorAll('input[name*="[total_amount]"]');
            totalInputs.forEach(input => {
                subTotal += parseFloat(input.value) || 0;
            });
            document.getElementById('sub_total').value = subTotal.toFixed(2);
            calculateTotal();
        }

        function calculateTotal() {
            const subTotal = parseFloat(document.getElementById('sub_total').value) || 0;
            const tva = parseFloat(document.getElementById('tva').value) || 0;
            const total = subTotal + tva;
            document.getElementById('total').value = total.toFixed(2);
        }

        // Pre-populate if quotation data exists
        <?php if ($quotation): ?>
        document.querySelector('input[name="items[0][total_amount]"]').value = '<?php echo $quotation["client_quote"]; ?>';
        calculateSubTotal();
        <?php endif; ?>
    </script>
</body>
</html>
