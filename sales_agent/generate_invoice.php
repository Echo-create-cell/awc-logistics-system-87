
<?php
require_once '../includes/functions.php';
require_once '../config/database.php';

checkAuth();
checkRole(['sales_agent', 'sales_director']);

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
        $year = date('Y');
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM invoices WHERE YEAR(issue_date) = ?");
        $stmt->execute([$year]);
        $count = $stmt->fetch()['count'] + 1;
        $invoice_number = 'INV-' . $year . '-' . str_pad($count, 6, '0', STR_PAD_LEFT);
        
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
            INSERT INTO invoices (quotation_id, invoice_number, client_id, destination, door_delivery, salesperson, deliver_date, 
                                payment_conditions, validity_date, awb_number, sub_total, tva, 
                                total_amount, currency, issue_date, due_date, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $_POST['quotation_id'],
            $invoice_number,
            $_POST['client_id'],
            $_POST['destination'],
            $_POST['door_delivery'],
            $_POST['salesperson'],
            empty($_POST['deliver_date']) ? null : $_POST['deliver_date'],
            $_POST['payment_conditions'],
            empty($_POST['validity_date']) ? null : $_POST['validity_date'],
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
                    empty($item['quantity_kg']) ? 0 : floatval($item['quantity_kg']),
                    $item['commodity'] ?? '',
                    $item['description'] ?? '',
                    empty($item['price']) ? 0 : floatval($item['price']),
                    empty($item['total_amount']) ? 0 : floatval($item['total_amount'])
                ]);
            }
        }

        $conn->commit();
        $success = "Invoice #{$invoice_number} created successfully!";
        
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

$pageTitle = "Generate Invoice";
require_once '../includes/header.php';
?>

<body class="bg-gray-100">
    <div class="flex">
        <?php require_once '../includes/sidebar.php'; ?>

        <!-- Main Content -->
        <div class="flex-1 p-8">
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-800">Generate Invoice</h2>
                <p class="text-gray-600">Create a new invoice from an approved quotation or from scratch.</p>
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
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b pb-8">
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">From Quotation ID</label>
                            <input type="number" name="quotation_id" value="<?php echo $quotation['id'] ?? ''; ?>" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                   placeholder="Optional">
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Client</label>
                            <select name="client_id" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                                <option value="">Select Client</option>
                                <?php foreach ($clients as $client): ?>
                                <option value="<?php echo $client['id']; ?>" <?php echo ($quotation && $quotation['client_id'] == $client['id']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($client['company_name']); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">AWB Number</label>
                            <input type="text" name="awb_number"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Destination</label>
                            <input type="text" name="destination" value="<?php echo htmlspecialchars($quotation['destination'] ?? ''); ?>"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Door Delivery</label>
                            <input type="text" name="door_delivery" value="<?php echo htmlspecialchars($quotation['door_delivery'] ?? ''); ?>"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Issue Date</label>
                            <input type="date" name="issue_date" value="<?php echo date('Y-m-d'); ?>" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                        </div>
                        
                         <div>
                            <label class="block text-gray-700 text-sm font-bold mb-2">Salesperson</label>
                            <input type="text" name="salesperson" value="<?php echo htmlspecialchars($_SESSION['user_name']); ?>" required 
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
                            <button type="button" id="add-item-btn"
                                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                Add Item
                            </button>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full border-collapse">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-2 border text-left text-sm">Quantity (kg)</th>
                                        <th class="px-4 py-2 border text-left text-sm">Commodity</th>
                                        <th class="px-4 py-2 border text-left text-sm w-1/3">Description</th>
                                        <th class="px-4 py-2 border text-left text-sm">Price</th>
                                        <th class="px-4 py-2 border text-left text-sm">Total Amount</th>
                                        <th class="px-4 py-2 border text-left text-sm">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="invoice-items-body">
                                    <!-- Item rows will be injected by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Invoice Totals -->
                    <div class="flex justify-end mb-6">
                        <div class="w-full md:w-1/3 space-y-3">
                            <div class="flex justify-between">
                                <label class="font-semibold">Sub-Total:</label>
                                <input type="number" step="0.01" id="sub_total_display" readonly 
                                       class="px-2 py-1 border rounded bg-gray-100 text-right w-40">
                            </div>
                            <div class="flex justify-between items-center">
                                <label class="font-semibold">TVA:</label>
                                <input type="number" step="0.01" name="tva" id="tva_input" value="0" 
                                       class="px-2 py-1 border rounded text-right w-40">
                            </div>
                            <div class="flex justify-between text-lg font-bold border-t pt-2">
                                <label>TOTAL:</label>
                                <input type="number" step="0.01" id="total_display" readonly 
                                       class="px-2 py-1 border rounded bg-gray-100 text-right w-40 font-bold">
                            </div>
                        </div>
                    </div>

                    <div class="flex space-x-4">
                        <button type="submit" 
                                class="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition duration-200">
                            Generate & Print Invoice
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
        document.addEventListener('DOMContentLoaded', function() {
            let itemCount = 0;
            const invoiceItemsBody = document.getElementById('invoice-items-body');
            const addItemBtn = document.getElementById('add-item-btn');
            const tvaInput = document.getElementById('tva_input');

            function addInvoiceItem(item = {}) {
                const newRow = document.createElement('tr');
                newRow.className = 'invoice-item-row';
                newRow.innerHTML = `
                    <td class="border px-2 py-1"><input type="number" step="0.01" name="items[${itemCount}][quantity_kg]" value="${item.quantity_kg || ''}" class="w-full px-2 py-1 border rounded"></td>
                    <td class="border px-2 py-1"><input type="text" name="items[${itemCount}][commodity]" value="${item.commodity || ''}" class="w-full px-2 py-1 border rounded"></td>
                    <td class="border px-2 py-1"><input type="text" name="items[${itemCount}][description]" value="${item.description || ''}" class="w-full px-2 py-1 border rounded"></td>
                    <td class="border px-2 py-1"><input type="number" step="0.01" name="items[${itemCount}][price]" value="${item.price || ''}" class="w-full px-2 py-1 border rounded"></td>
                    <td class="border px-2 py-1"><input type="number" step="0.01" name="items[${itemCount}][total_amount]" value="${item.total_amount || ''}" class="w-full px-2 py-1 border rounded item-total"></td>
                    <td class="border px-2 py-1 text-center"><button type="button" class="text-red-600 hover:text-red-800 remove-item-btn">Remove</button></td>
                `;
                invoiceItemsBody.appendChild(newRow);
                itemCount++;
                updateCalculations();
            }

            function updateCalculations() {
                let subTotal = 0;
                document.querySelectorAll('.item-total').forEach(input => {
                    subTotal += parseFloat(input.value) || 0;
                });
                
                const tva = parseFloat(tvaInput.value) || 0;
                const total = subTotal + tva;

                document.getElementById('sub_total_display').value = subTotal.toFixed(2);
                document.getElementById('total_display').value = total.toFixed(2);
            }

            addItemBtn.addEventListener('click', () => addInvoiceItem());

            invoiceItemsBody.addEventListener('click', function(e) {
                if (e.target.classList.contains('remove-item-btn')) {
                    e.target.closest('tr').remove();
                    updateCalculations();
                }
            });

            document.getElementById('invoiceForm').addEventListener('input', function(e) {
                if (e.target.classList.contains('item-total') || e.target.id === 'tva_input') {
                    updateCalculations();
                }
            });

            // Pre-populate if quotation data exists
            <?php if ($quotation): ?>
                addInvoiceItem({
                    description: 'Services as per quotation #<?php echo $quotation["id"]; ?>',
                    total_amount: '<?php echo $quotation["client_quote"]; ?>'
                });
            <?php else: ?>
                // Add one empty row to start
                addInvoiceItem();
            <?php endif; ?>
        });
    </script>
</body>
</html>
