
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
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quotation Management - AWC Logistics</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="flex">
        <!-- Sidebar -->
        <div class="bg-slate-900 text-white w-64 min-h-screen p-4">
            <div class="mb-8">
                <h1 class="text-xl font-bold text-blue-400">AWC Logistics</h1>
                <p class="text-sm text-slate-400">Admin Panel</p>
            </div>
            
            <nav class="space-y-2">
                <a href="index.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>Dashboard</span>
                </a>
                <a href="users.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>User Management</span>
                </a>
                <a href="quotations.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 text-white">
                    <span>Quotation Approvals</span>
                </a>
                <a href="clients.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>Client Management</span>
                </a>
                <a href="../auth/logout.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>Logout</span>
                </a>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1 p-8">
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-gray-800">Quotation Management</h2>
                <p class="text-gray-600">Review and approve quotations</p>
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-lg shadow p-4 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select id="statusFilter" onchange="filterQuotations()" class="px-3 py-2 border border-gray-300 rounded-md">
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                    </select>
                    <input type="text" id="searchInput" placeholder="Search..." onkeyup="filterQuotations()" 
                           class="px-3 py-2 border border-gray-300 rounded-md">
                    <input type="date" id="dateFrom" onchange="filterQuotations()" 
                           class="px-3 py-2 border border-gray-300 rounded-md">
                    <input type="date" id="dateTo" onchange="filterQuotations()" 
                           class="px-3 py-2 border border-gray-300 rounded-md">
                </div>
            </div>

            <!-- Quotations Table -->
            <div class="bg-white rounded-lg shadow overflow-x-auto">
                <table class="w-full" id="quotationsTable">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sender</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <?php foreach ($quotations as $quotation): ?>
                        <tr class="quotation-row" data-status="<?php echo $quotation['status']; ?>" 
                            data-date="<?php echo $quotation['created_at']; ?>">
                            <td class="px-6 py-4 text-sm text-gray-900"><?php echo $quotation['id']; ?></td>
                            <td class="px-6 py-4 text-sm text-gray-900"><?php echo $quotation['client_name'] ?? 'N/A'; ?></td>
                            <td class="px-6 py-4 text-sm text-gray-900"><?php echo $quotation['volume']; ?></td>
                            <td class="px-6 py-4 text-sm text-gray-900">
                                <?php echo $quotation['currency'] . ' ' . number_format($quotation['client_quote'], 2); ?>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-900">
                                <?php echo $quotation['currency'] . ' ' . number_format($quotation['profit'], 2); ?>
                                <small class="text-gray-500">(<?php echo $quotation['profit_percentage']; ?>)</small>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-900"><?php echo $quotation['sender_name']; ?></td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 text-xs rounded-full 
                                    <?php 
                                    switch($quotation['status']) {
                                        case 'pending': echo 'bg-yellow-100 text-yellow-800'; break;
                                        case 'approved': echo 'bg-blue-100 text-blue-800'; break;
                                        case 'rejected': echo 'bg-red-100 text-red-800'; break;
                                        case 'won': echo 'bg-green-100 text-green-800'; break;
                                        case 'lost': echo 'bg-gray-100 text-gray-800'; break;
                                    }
                                    ?>">
                                    <?php echo ucfirst($quotation['status']); ?>
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500">
                                <?php echo date('d/m/Y', strtotime($quotation['created_at'])); ?>
                            </td>
                            <td class="px-6 py-4 text-sm">
                                <div class="flex space-x-2">
                                    <button onclick="viewQuotation(<?php echo $quotation['id']; ?>)" 
                                            class="text-blue-600 hover:text-blue-900">View</button>
                                    <?php if ($quotation['status'] == 'pending'): ?>
                                    <button onclick="approveQuotation(<?php echo $quotation['id']; ?>)" 
                                            class="text-green-600 hover:text-green-900">Approve</button>
                                    <button onclick="rejectQuotation(<?php echo $quotation['id']; ?>)" 
                                            class="text-red-600 hover:text-red-900">Reject</button>
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

    <!-- View Quotation Modal -->
    <div id="quotationModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                <div class="p-6" id="quotationDetails">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        </div>
    </div>

    <script>
        function filterQuotations() {
            const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
            const searchInput = document.getElementById('searchInput').value.toLowerCase();
            const dateFrom = document.getElementById('dateFrom').value;
            const dateTo = document.getElementById('dateTo').value;
            
            const rows = document.querySelectorAll('.quotation-row');
            
            rows.forEach(row => {
                const status = row.dataset.status;
                const text = row.textContent.toLowerCase();
                const date = new Date(row.dataset.date);
                
                let showRow = true;
                
                if (statusFilter && status !== statusFilter) showRow = false;
                if (searchInput && !text.includes(searchInput)) showRow = false;
                if (dateFrom && date < new Date(dateFrom)) showRow = false;
                if (dateTo && date > new Date(dateTo)) showRow = false;
                
                row.style.display = showRow ? '' : 'none';
            });
        }

        function viewQuotation(id) {
            fetch(`../ajax/get_quotation.php?id=${id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('quotationDetails').innerHTML = data.html;
                        document.getElementById('quotationModal').classList.remove('hidden');
                    }
                });
        }

        function closeModal() {
            document.getElementById('quotationModal').classList.add('hidden');
        }

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

        // Close modal when clicking outside
        document.getElementById('quotationModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    </script>
</body>
</html>
