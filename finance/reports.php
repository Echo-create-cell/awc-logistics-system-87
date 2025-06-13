
<?php
require_once '../includes/functions.php';
require_once '../config/database.php';

checkAuth();
checkRole(['finance_officer', 'admin']);

$database = new Database();
$conn = $database->getConnection();

// Date filters
$date_from = $_GET['date_from'] ?? date('Y-m-01');
$date_to = $_GET['date_to'] ?? date('Y-m-t');

// Get revenue statistics
$stmt = $conn->prepare("
    SELECT 
        COUNT(*) as total_invoices,
        SUM(total_amount) as total_revenue,
        SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_revenue,
        SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END) as pending_revenue,
        SUM(CASE WHEN status = 'overdue' THEN total_amount ELSE 0 END) as overdue_revenue
    FROM invoices 
    WHERE issue_date BETWEEN ? AND ?
");
$stmt->execute([$date_from, $date_to]);
$revenue_stats = $stmt->fetch();

// Get quotation statistics
$stmt = $conn->prepare("
    SELECT 
        COUNT(*) as total_quotations,
        SUM(profit) as total_profit,
        COUNT(CASE WHEN status = 'won' THEN 1 END) as won_quotations,
        COUNT(CASE WHEN status = 'lost' THEN 1 END) as lost_quotations,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_quotations
    FROM quotations 
    WHERE created_at BETWEEN ? AND ?
");
$stmt->execute([$date_from, $date_to]);
$quotation_stats = $stmt->fetch();

// Get monthly revenue breakdown
$stmt = $conn->prepare("
    SELECT 
        DATE_FORMAT(issue_date, '%Y-%m') as month,
        SUM(total_amount) as revenue,
        COUNT(*) as invoice_count
    FROM invoices 
    WHERE issue_date BETWEEN ? AND ?
    GROUP BY DATE_FORMAT(issue_date, '%Y-%m')
    ORDER BY month
");
$stmt->execute([$date_from, $date_to]);
$monthly_revenue = $stmt->fetchAll();

// Get top clients by revenue
$stmt = $conn->prepare("
    SELECT 
        c.company_name,
        SUM(i.total_amount) as total_revenue,
        COUNT(i.id) as invoice_count
    FROM invoices i
    JOIN clients c ON i.client_id = c.id
    WHERE i.issue_date BETWEEN ? AND ?
    GROUP BY c.id, c.company_name
    ORDER BY total_revenue DESC
    LIMIT 10
");
$stmt->execute([$date_from, $date_to]);
$top_clients = $stmt->fetchAll();

// Get sales performance by user
$stmt = $conn->prepare("
    SELECT 
        u.name,
        COUNT(q.id) as quotations_created,
        SUM(q.profit) as total_profit,
        COUNT(CASE WHEN q.status = 'won' THEN 1 END) as won_quotations,
        ROUND((COUNT(CASE WHEN q.status = 'won' THEN 1 END) / COUNT(q.id)) * 100, 2) as win_rate
    FROM quotations q
    JOIN users u ON q.quote_sent_by = u.id
    WHERE q.created_at BETWEEN ? AND ?
    GROUP BY u.id, u.name
    ORDER BY total_profit DESC
");
$stmt->execute([$date_from, $date_to]);
$sales_performance = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Financial Reports - AWC Logistics</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-100">
    <div class="flex">
        <!-- Sidebar -->
        <div class="bg-slate-900 text-white w-64 min-h-screen p-4">
            <div class="mb-8">
                <h1 class="text-xl font-bold text-blue-400">AWC Logistics</h1>
                <p class="text-sm text-slate-400">Finance Officer</p>
            </div>
            
            <nav class="space-y-2">
                <a href="index.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>Dashboard</span>
                </a>
                <a href="reports.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 text-white">
                    <span>Financial Reports</span>
                </a>
                <a href="analytics.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>Analytics</span>
                </a>
                <a href="../auth/logout.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>Logout</span>
                </a>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1 p-8">
            <div class="mb-8">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800">Financial Reports</h2>
                        <p class="text-gray-600">Comprehensive financial analysis and reporting</p>
                    </div>
                    <button onclick="printReport()" 
                            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                        Print Report
                    </button>
                </div>
            </div>

            <!-- Date Filter -->
            <div class="bg-white rounded-lg shadow p-4 mb-6">
                <form method="GET" class="flex items-center space-x-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input type="date" name="date_from" value="<?php echo $date_from; ?>" 
                               class="px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input type="date" name="date_to" value="<?php echo $date_to; ?>" 
                               class="px-3 py-2 border border-gray-300 rounded-md">
                    </div>
                    <div class="pt-6">
                        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Filter
                        </button>
                    </div>
                </form>
            </div>

            <!-- Revenue Statistics -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-green-100 rounded-lg">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p class="text-2xl font-semibold text-gray-900">$<?php echo number_format($revenue_stats['total_revenue'] ?? 0, 2); ?></p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Invoices</p>
                            <p class="text-2xl font-semibold text-gray-900"><?php echo $revenue_stats['total_invoices'] ?? 0; ?></p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-purple-100 rounded-lg">
                            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Profit</p>
                            <p class="text-2xl font-semibold text-gray-900">$<?php echo number_format($quotation_stats['total_profit'] ?? 0, 2); ?></p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-yellow-100 rounded-lg">
                            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Win Rate</p>
                            <p class="text-2xl font-semibold text-gray-900">
                                <?php 
                                $total_quotes = $quotation_stats['total_quotations'] ?? 0;
                                $won_quotes = $quotation_stats['won_quotations'] ?? 0;
                                $win_rate = $total_quotes > 0 ? round(($won_quotes / $total_quotes) * 100, 1) : 0;
                                echo $win_rate . '%';
                                ?>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- Monthly Revenue Chart -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue Trend</h3>
                    <canvas id="revenueChart" height="300"></canvas>
                </div>

                <!-- Revenue Status Pie Chart -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Revenue by Status</h3>
                    <canvas id="statusChart" height="300"></canvas>
                </div>
            </div>

            <!-- Top Clients -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Top Clients by Revenue</h3>
                    <div class="space-y-4">
                        <?php foreach ($top_clients as $client): ?>
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div>
                                <p class="font-medium text-gray-900"><?php echo $client['company_name']; ?></p>
                                <p class="text-sm text-gray-500"><?php echo $client['invoice_count']; ?> invoices</p>
                            </div>
                            <p class="text-lg font-semibold text-green-600">$<?php echo number_format($client['total_revenue'], 2); ?></p>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Sales Performance -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Sales Performance</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="text-left text-gray-600">
                                    <th class="pb-2">Sales Person</th>
                                    <th class="pb-2">Quotations</th>
                                    <th class="pb-2">Won</th>
                                    <th class="pb-2">Win Rate</th>
                                    <th class="pb-2">Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($sales_performance as $sales): ?>
                                <tr class="border-t">
                                    <td class="py-2 font-medium"><?php echo $sales['name']; ?></td>
                                    <td class="py-2"><?php echo $sales['quotations_created']; ?></td>
                                    <td class="py-2"><?php echo $sales['won_quotations']; ?></td>
                                    <td class="py-2"><?php echo $sales['win_rate']; ?>%</td>
                                    <td class="py-2 text-green-600">$<?php echo number_format($sales['total_profit'], 2); ?></td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Monthly Revenue Chart
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        const revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: <?php echo json_encode(array_column($monthly_revenue, 'month')); ?>,
                datasets: [{
                    label: 'Revenue ($)',
                    data: <?php echo json_encode(array_column($monthly_revenue, 'revenue')); ?>,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        // Revenue Status Chart
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        const statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Paid', 'Pending', 'Overdue'],
                datasets: [{
                    data: [
                        <?php echo $revenue_stats['paid_revenue'] ?? 0; ?>,
                        <?php echo $revenue_stats['pending_revenue'] ?? 0; ?>,
                        <?php echo $revenue_stats['overdue_revenue'] ?? 0; ?>
                    ],
                    backgroundColor: [
                        'rgb(34, 197, 94)',
                        'rgb(251, 191, 36)',
                        'rgb(239, 68, 68)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        function printReport() {
            window.print();
        }
    </script>
</body>
</html>
