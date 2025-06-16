
<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !isset($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized or missing ID']);
    exit();
}

$database = new Database();
$conn = $database->getConnection();

$stmt = $conn->prepare("
    SELECT q.*, u.name as sender_name, c.company_name as client_name, c.contact_person,
           approver.name as approved_by_name
    FROM quotations q 
    JOIN users u ON q.quote_sent_by = u.id 
    LEFT JOIN clients c ON q.client_id = c.id
    LEFT JOIN users approver ON q.approved_by = approver.id
    WHERE q.id = ?
");
$stmt->execute([$_GET['id']]);
$quotation = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$quotation) {
    echo json_encode(['success' => false, 'message' => 'Quotation not found']);
    exit();
}

function renderStatusBadge($status) {
    $baseClass = "px-2 py-1 text-xs font-semibold rounded-full";
    switch($status) {
        case 'pending': return "$baseClass bg-yellow-100 text-yellow-800";
        case 'approved': return "$baseClass bg-blue-100 text-blue-800";
        case 'rejected': return "$baseClass bg-red-100 text-red-800";
        case 'won': return "$baseClass bg-green-100 text-green-800";
        case 'lost': return "$baseClass bg-gray-100 text-gray-800";
        default: return "$baseClass bg-gray-100 text-gray-800";
    }
}

$html = '
<div class="space-y-4">
    <div class="flex justify-between items-start">
        <h4 class="text-xl font-bold text-gray-800">Quotation #' . htmlspecialchars($quotation['id']) . ' Details</h4>
        <span class="' . renderStatusBadge($quotation['status']) . '">' . ucfirst($quotation['status']) . '</span>
    </div>
    
    <div class="grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4">
        <div><p class="text-sm text-gray-500">Client</p><p class="font-medium">' . htmlspecialchars($quotation['client_name'] ?? 'N/A') . '</p></div>
        <div><p class="text-sm text-gray-500">Contact Person</p><p class="font-medium">' . htmlspecialchars($quotation['contact_person'] ?? 'N/A') . '</p></div>
        <div><p class="text-sm text-gray-500">Volume</p><p class="font-medium">' . htmlspecialchars($quotation['volume']) . '</p></div>
        <div><p class="text-sm text-gray-500">Destination</p><p class="font-medium">' . htmlspecialchars($quotation['destination'] ?? 'N/A') . '</p></div>
        <div><p class="text-sm text-gray-500">Buy Rate</p><p class="font-medium">' . htmlspecialchars($quotation['currency']) . ' ' . number_format($quotation['buy_rate'], 2) . '</p></div>
        <div><p class="text-sm text-gray-500">Client Quote</p><p class="font-medium">' . htmlspecialchars($quotation['currency']) . ' ' . number_format($quotation['client_quote'], 2) . '</p></div>
        <div><p class="text-sm text-gray-500">Profit</p><p class="font-medium text-green-600">' . htmlspecialchars($quotation['currency']) . ' ' . number_format($quotation['profit'], 2) . ' (' . htmlspecialchars($quotation['profit_percentage']) . ')</p></div>
        <div><p class="text-sm text-gray-500">Created By</p><p class="font-medium">' . htmlspecialchars($quotation['sender_name']) . '</p></div>
        <div><p class="text-sm text-gray-500">Created At</p><p class="font-medium">' . date('d/m/Y H:i', strtotime($quotation['created_at'])) . '</p></div>';

if ($quotation['approved_by_name']) {
    $html .= '
        <div><p class="text-sm text-gray-500">Approved By</p><p class="font-medium">' . htmlspecialchars($quotation['approved_by_name']) . '</p></div>
        <div><p class="text-sm text-gray-500">Approved At</p><p class="font-medium">' . date('d/m/Y H:i', strtotime($quotation['approved_at'])) . '</p></div>';
}

$html .= '
    </div>
    
    <div class="border-t pt-4">
        <p class="text-sm text-gray-500">Remarks</p>
        <p class="font-medium mt-1 p-2 bg-gray-50 rounded">' . (empty($quotation['remarks']) ? 'No remarks.' : nl2br(htmlspecialchars($quotation['remarks']))) . '</p>
    </div>
    
    <div class="flex justify-end space-x-3 pt-4 border-t">
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Close</button>';

if ($quotation['status'] == 'pending' && ($_SESSION['user_role'] == 'admin' || $_SESSION['user_role'] == 'sales_director')) {
    $html .= '
        <button onclick="approveQuotation(' . $quotation['id'] . ')" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Approve</button>
        <button onclick="rejectQuotation(' . $quotation['id'] . ')" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Reject</button>';
}

if ($quotation['status'] == 'approved' && ($_SESSION['user_role'] == 'sales_agent' || $_SESSION['user_role'] == 'sales_director')) {
    $html .= '<a href="generate_invoice.php?quotation_id=' . $quotation['id'] . '" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Generate Invoice</a>';
}

$html .= '
    </div>
</div>';

echo json_encode(['success' => true, 'html' => $html]);
?>
