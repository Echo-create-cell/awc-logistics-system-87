
<?php
require_once '../includes/functions.php';
require_once '../config/database.php';

checkAuth();
checkRole(['admin', 'sales_director']);

$database = new Database();
$conn = $database->getConnection();

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'add_client':
                $stmt = $conn->prepare("
                    INSERT INTO clients (company_name, contact_person, tin_number, address, city, country, phone, email) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                if ($stmt->execute([
                    $_POST['company_name'], $_POST['contact_person'], $_POST['tin_number'], 
                    $_POST['address'], $_POST['city'], $_POST['country'], $_POST['phone'], $_POST['email']
                ])) {
                    $success = "Client added successfully!";
                } else {
                    $error = "Failed to add client.";
                }
                break;
                
            case 'update_client':
                $stmt = $conn->prepare("
                    UPDATE clients SET company_name = ?, contact_person = ?, tin_number = ?, 
                           address = ?, city = ?, country = ?, phone = ?, email = ? 
                    WHERE id = ?
                ");
                if ($stmt->execute([
                    $_POST['company_name'], $_POST['contact_person'], $_POST['tin_number'], 
                    $_POST['address'], $_POST['city'], $_POST['country'], $_POST['phone'], 
                    $_POST['email'], $_POST['client_id']
                ])) {
                    $success = "Client updated successfully!";
                } else {
                    $error = "Failed to update client.";
                }
                break;
        }
    }
}

// Get all clients
$stmt = $conn->prepare("SELECT * FROM clients ORDER BY company_name");
$stmt->execute();
$clients = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Client Management - AWC Logistics</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="flex">
        <!-- Sidebar -->
        <div class="bg-slate-900 text-white w-64 min-h-screen p-4">
            <div class="mb-8">
                <h1 class="text-xl font-bold text-blue-400">AWC Logistics</h1>
                <p class="text-sm text-slate-400"><?php echo ucfirst(str_replace('_', ' ', $_SESSION['user_role'])); ?></p>
            </div>
            
            <nav class="space-y-2">
                <a href="index.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>Dashboard</span>
                </a>
                <?php if ($_SESSION['user_role'] == 'admin'): ?>
                <a href="users.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>User Management</span>
                </a>
                <a href="quotations.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800">
                    <span>Quotation Approvals</span>
                </a>
                <?php endif; ?>
                <a href="clients.php" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 text-white">
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
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800">Client Management</h2>
                        <p class="text-gray-600">Manage your clients and their information</p>
                    </div>
                    <button onclick="openClientModal()" 
                            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                        Add New Client
                    </button>
                </div>
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

            <!-- Clients Table -->
            <div class="bg-white rounded-lg shadow overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Person</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <?php foreach ($clients as $client): ?>
                        <tr>
                            <td class="px-6 py-4">
                                <div>
                                    <div class="text-sm font-medium text-gray-900"><?php echo $client['company_name']; ?></div>
                                    <?php if ($client['tin_number']): ?>
                                    <div class="text-sm text-gray-500">TIN: <?php echo $client['tin_number']; ?></div>
                                    <?php endif; ?>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-900"><?php echo $client['contact_person']; ?></td>
                            <td class="px-6 py-4 text-sm text-gray-900">
                                <?php echo $client['city']; ?><?php echo $client['country'] ? ', ' . $client['country'] : ''; ?>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-900"><?php echo $client['phone']; ?></td>
                            <td class="px-6 py-4 text-sm text-gray-900"><?php echo $client['email']; ?></td>
                            <td class="px-6 py-4 text-sm">
                                <button onclick="editClient(<?php echo htmlspecialchars(json_encode($client)); ?>)" 
                                        class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                                <button onclick="viewClientQuotations(<?php echo $client['id']; ?>)" 
                                        class="text-green-600 hover:text-green-900">Quotations</button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Client Modal -->
    <div id="clientModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-lg max-w-2xl w-full">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold" id="modalTitle">Add New Client</h3>
                        <button onclick="closeClientModal()" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form method="POST" id="clientForm">
                        <input type="hidden" name="action" id="formAction" value="add_client">
                        <input type="hidden" name="client_id" id="clientId">
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">Company Name *</label>
                                <input type="text" name="company_name" id="companyName" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">Contact Person</label>
                                <input type="text" name="contact_person" id="contactPerson" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">TIN Number</label>
                                <input type="text" name="tin_number" id="tinNumber" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                                <input type="text" name="phone" id="phone" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                <input type="email" name="email" id="email" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">City</label>
                                <input type="text" name="city" id="city" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">Country</label>
                                <input type="text" name="country" id="country" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <label class="block text-gray-700 text-sm font-bold mb-2">Address</label>
                            <textarea name="address" id="address" rows="3" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"></textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-4 mt-6">
                            <button type="button" onclick="closeClientModal()" 
                                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Save Client
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script>
        function openClientModal() {
            document.getElementById('modalTitle').textContent = 'Add New Client';
            document.getElementById('formAction').value = 'add_client';
            document.getElementById('clientForm').reset();
            document.getElementById('clientId').value = '';
            document.getElementById('clientModal').classList.remove('hidden');
        }

        function editClient(client) {
            document.getElementById('modalTitle').textContent = 'Edit Client';
            document.getElementById('formAction').value = 'update_client';
            document.getElementById('clientId').value = client.id;
            document.getElementById('companyName').value = client.company_name;
            document.getElementById('contactPerson').value = client.contact_person || '';
            document.getElementById('tinNumber').value = client.tin_number || '';
            document.getElementById('phone').value = client.phone || '';
            document.getElementById('email').value = client.email || '';
            document.getElementById('city').value = client.city || '';
            document.getElementById('country').value = client.country || '';
            document.getElementById('address').value = client.address || '';
            document.getElementById('clientModal').classList.remove('hidden');
        }

        function closeClientModal() {
            document.getElementById('clientModal').classList.add('hidden');
        }

        function viewClientQuotations(clientId) {
            window.location.href = `quotations.php?client_id=${clientId}`;
        }

        // Close modal when clicking outside
        document.getElementById('clientModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeClientModal();
            }
        });
    </script>
</body>
</html>
