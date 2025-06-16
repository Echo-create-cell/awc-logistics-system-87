<?php
require_once '../includes/functions.php';
require_once '../config/database.php';

checkAuth();
checkRole(['admin']);

$database = new Database();
$conn = $database->getConnection();

// Get all quotations with client and sender information
$stmt = $conn->prepare("
    SELECT q.*, u.name as sender_name, c.company_name as client_name,
           approver.name as approved_by_name
    FROM quotations q 
    JOIN users u ON q.quote_sent_by = u.id 
    LEFT JOIN clients c ON q.client_id = c.id
    LEFT JOIN users approver ON q.approved_by = approver.id
    ORDER BY q.created_at DESC
");
$stmt->execute();
$quotations = $stmt->fetchAll();

$pageTitle = "Quotation Management";
require_once '../includes/header.php';
?>

<body class="bg-gray-100">
    <div class="flex">
        <?php require_once '../includes/sidebar.php'; ?>

        <!-- Main Content -->
        <div class="flex-1 p-8">
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-800">Quotation Management</h2>
                <p class="text-gray-600">Review, approve, and manage all quotations.</p>
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-lg shadow p-4 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select id="statusFilter" onchange="filterTable()" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                    </select>
                    <input type="text" id="searchInput" placeholder="Search client, sender, or ID..." onkeyup="filterTable()" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <div>
                        <label for="dateFrom" class="text-sm">From:</label>
                        <input type="date" id="dateFrom" onchange="filterTable()" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                    <div>
                        <label for="dateTo" class="text-sm">To:</label>
                        <input type="date" id="dateTo" onchange="filterTable()" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                </div>
            </div>

            <!-- Quotations Table -->
            <div class="bg-white rounded-lg shadow overflow-x-auto">
                <table class="w-full" id="data-table">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sender</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <?php foreach ($quotations as $q): ?>
                        <tr class="data-row" data-status="<?php echo $q['status']; ?>" 
                            data-date="<?php echo date('Y-m-d', strtotime($q['created_at'])); ?>">
                            <td class="px-6 py-4 text-sm text-gray-900"><?php echo $q['id']; ?></td>
                            <td class="px-6 py-4 text-sm text-gray-900"><?php echo htmlspecialchars($q['client_name'] ?? 'N/A'); ?></td>
                            <td class="px-6 py-4 text-sm text-gray-900"><?php echo htmlspecialchars($q['currency'] . ' ' . number_format($q['client_quote'], 2)); ?></td>
                            <td class="px-6 py-4 text-sm text-green-600"><?php echo htmlspecialchars($q['currency'] . ' ' . number_format($q['profit'], 2) . ' (' . $q['profit_percentage'] . ')'); ?></td>
                            <td class="px-6 py-4 text-sm text-gray-900"><?php echo htmlspecialchars($q['sender_name']); ?></td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full <?php echo getStatusClass($q['status']); ?>">
                                    <?php echo ucfirst($q['status']); ?>
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500"><?php echo date('d/m/Y', strtotime($q['created_at'])); ?></td>
                            <td class="px-6 py-4 text-sm">
                                <div class="flex space-x-2">
                                    <a href="print_quotation.php?id=<?php echo $q['id']; ?>" target="_blank" class="text-gray-600 hover:text-gray-900">Print</a>
                                    <?php if ($q['status'] == 'pending'): ?>
                                    <button onclick="approveQuotation(<?php echo $q['id']; ?>)" class="text-green-600 hover:text-green-900">Approve</button>
                                    <button onclick="rejectQuotation(<?php echo $q['id']; ?>)" class="text-red-600 hover:text-red-900">Reject</button>
                                    <?php endif; ?>
                                </div>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="../js/main.js"></script>
    <script>
        function approveQuotation(id) {
            if (confirm('Are you sure you want to approve this quotation?')) {
                fetch('../ajax/approve_quotation.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quotation_id: id })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Error: ' + data.message);
                    }
                });
            }
        }

        function rejectQuotation(id) {
            if (confirm('Are you sure you want to reject this quotation?')) {
                fetch('../ajax/reject_quotation.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quotation_id: id })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Error: ' + data.message);
                    }
                });
            }
        }
    </script>
</body>
</html>
