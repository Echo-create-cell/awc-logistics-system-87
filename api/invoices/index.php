<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Fetch all invoices with items
        $query = "SELECT i.*, 
                  GROUP_CONCAT(DISTINCT CONCAT(ii.id, ':', ii.commodity, ':', ii.quantity_kg, ':', ii.total) SEPARATOR '||') as items
                  FROM invoices i
                  LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
                  WHERE i.created_by = :user_id
                  GROUP BY i.id
                  ORDER BY i.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        $stmt->execute();
        
        $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($invoices);
        break;

    case 'POST':
        // Create new invoice
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "INSERT INTO invoices 
                  (quotation_id, invoice_number, client_name, client_address, client_contact_person,
                   client_tin, destination, door_delivery, salesperson, deliver_date, payment_conditions,
                   validity_date, awb_number, sub_total, tva, total_amount, currency, issue_date,
                   due_date, status, created_by)
                  VALUES 
                  (:quotation_id, :invoice_number, :client_name, :client_address, :client_contact_person,
                   :client_tin, :destination, :door_delivery, :salesperson, :deliver_date, :payment_conditions,
                   :validity_date, :awb_number, :sub_total, :tva, :total_amount, :currency, :issue_date,
                   :due_date, :status, :created_by)";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':quotation_id', $data->quotationId);
        $stmt->bindParam(':invoice_number', $data->invoiceNumber);
        $stmt->bindParam(':client_name', $data->clientName);
        $stmt->bindParam(':client_address', $data->clientAddress);
        $stmt->bindParam(':client_contact_person', $data->clientContactPerson);
        $stmt->bindParam(':client_tin', $data->clientTin);
        $stmt->bindParam(':destination', $data->destination);
        $stmt->bindParam(':door_delivery', $data->doorDelivery);
        $stmt->bindParam(':salesperson', $data->salesperson);
        $stmt->bindParam(':deliver_date', $data->deliverDate);
        $stmt->bindParam(':payment_conditions', $data->paymentConditions);
        $stmt->bindParam(':validity_date', $data->validityDate);
        $stmt->bindParam(':awb_number', $data->awbNumber);
        $stmt->bindParam(':sub_total', $data->subTotal);
        $stmt->bindParam(':tva', $data->tva);
        $stmt->bindParam(':total_amount', $data->totalAmount);
        $stmt->bindParam(':currency', $data->currency);
        $stmt->bindParam(':issue_date', $data->issueDate);
        $stmt->bindParam(':due_date', $data->dueDate);
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':created_by', $_SESSION['user_id']);
        
        if ($stmt->execute()) {
            $invoice_id = $db->lastInsertId();
            
            // Insert invoice items
            if (isset($data->items) && is_array($data->items)) {
                $item_query = "INSERT INTO invoice_items 
                              (invoice_id, commodity, quantity_kg, total) 
                              VALUES (:invoice_id, :commodity, :quantity_kg, :total)";
                $item_stmt = $db->prepare($item_query);
                
                foreach ($data->items as $item) {
                    $item_stmt->bindParam(':invoice_id', $invoice_id);
                    $item_stmt->bindParam(':commodity', $item->commodity);
                    $item_stmt->bindParam(':quantity_kg', $item->quantityKg);
                    $item_stmt->bindParam(':total', $item->total);
                    $item_stmt->execute();
                }
            }
            
            http_response_code(201);
            echo json_encode(["message" => "Invoice created", "id" => $invoice_id]);
        } else {
            http_response_code(503);
            echo json_encode(["error" => "Failed to create invoice"]);
        }
        break;

    case 'PUT':
        // Update invoice
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "UPDATE invoices SET 
                  status = :status,
                  total_amount = :total_amount
                  WHERE id = :id AND created_by = :user_id";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':total_amount', $data->totalAmount);
        $stmt->bindParam(':id', $data->id);
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "Invoice updated"]);
        } else {
            http_response_code(503);
            echo json_encode(["error" => "Failed to update invoice"]);
        }
        break;

    case 'DELETE':
        // Delete invoice
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            $query = "DELETE FROM invoices WHERE id = :id AND created_by = :user_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':user_id', $_SESSION['user_id']);
            
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "Invoice deleted"]);
            } else {
                http_response_code(503);
                echo json_encode(["error" => "Failed to delete invoice"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "ID required"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>
