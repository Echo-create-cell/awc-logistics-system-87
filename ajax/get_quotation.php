
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
$quotation = $stmt->fetch();

if (!$quotation) {
    echo json_encode(['success' => false, 'message' => 'Quotation not found']);
    exit();
}

$html = '
<div class="space-y-4">
    <h4 class="text-xl font-bold text-gray-800">Quotation #' . $quotation['id'] . '</h4>
    
    <div class="grid grid-cols-2 gap-4">
        <div>
            <p class="text-sm text-gray-600">Client</p>
            <p class="font-medium">' . ($quotation['client_name'] ?? 'N/A') . '</p>
        </div>
        <div>
            <p class="text-sm text-gray-600">Contact Person</p>
            <p class="font-medium">' . ($quotation['contact_person'] ?? 'N/A') . '</p>
        </div>
        <div>
            <p class="text-sm text-gray-600">Volume</p>
            <p class="font-medium">' . $quotation['volume'] . '</p>
        </div>
        <div>
            <p class="text-sm text-gray-600">Currency</p>
            <p class="font-medium">' . $quotation['currency'] . '</p>
        </div>
        <div>
            <p class="text-sm text-gray-600">Buy Rate</p>
            <p class="font-medium">' . $quotation['currency'] . ' ' . number_format($quotation['buy_rate'], 2) . '</p>
        </div>
        <div>
            <p class="text-sm text-gray-600">Client Quote</p>
            <p class="font-medium">' . $quotation['currency'] . ' ' . number_format($quotation['client_quote'], 2) . '</p>
        </div>
        <div>
            <p class="text-sm text-gray-600">Profit</p>
            <p class="font-medium text-green-600">' . $quotation['currency'] . ' ' . number_format($quotation['profit'], 2) . ' (' . $quotation['profit_percentage'] . ')</p>
        </div>
        <div>
            <p class="text-sm text-gray-600">Status</p>
            <span class="px-2 py-1 text-xs rounded-full 
                ' . (
                    $quotation['status'] == 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    ($quotation['status'] == 'approved' ? 'bg-blue-100 text-blue-800' :
                    ($quotation['status'] == 'rejected' ? 'bg-red-100 text-red-800' :
                    ($quotation['status'] == 'won' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')))
                ) . '">
                ' . ucfirst($quotation['status']) . '
            </span>
        </div>
        <div>
            <p class="text-sm text-gray-600">Created By</p>
            <p class="font-medium">' . $quotation['sender_name'] . '</p>
        </div>
        <div>
            <p class="text-sm text-gray-600">Created Date</p>
            <p class="font-medium">' . date('d/m/Y H:i', strtotime($quotation['created_at'])) . '</p>
        </div>';

if ($quotation['approved_by_name']) {
    $html .= '
        <div>
            <p class="text-sm text-gray-600">Approved By</p>
            <p class="font-medium">' . $quotation['approved_by_name'] . '</p>
        </div>
        <div>
            <p class="text-sm text-gray-600">Approved Date</p>
            <p class="font-medium">' . date('d/m/Y H:i', strtotime($quotation['approved_at'])) . '</p>
        </div>';
}

$html .= '
    </div>
    
    <div>
        <p class="text-sm text-gray-600">Remarks</p>
        <p class="font-medium">' . ($quotation['remarks'] ?: 'No remarks') . '</p>
    </div>
    
    <div class="flex justify-end space-x-4 pt-4 border-t">
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Close
        </button>';

if ($quotation['status'] == 'pending' && $_SESSION['user_role'] == 'admin') {
    $html .= '
        <button onclick="approveQuotation(' . $quotation['id'] . '); closeModal();" 
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Approve
        </button>
        <button onclick="rejectQuotation(' . $quotation['id'] . '); closeModal();" 
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Reject
        </button>';
}

$html .= '
    </div>
</div>';

echo json_encode(['success' => true, 'html' => $html]);
?>
