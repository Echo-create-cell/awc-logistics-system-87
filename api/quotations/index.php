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
        // Fetch all quotations
        $query = "SELECT q.*, u.name as quote_sent_by_name, 
                  GROUP_CONCAT(CONCAT(qc.name, ':', qc.quantity_kg, ':', qc.rate, ':', qc.client_rate) SEPARATOR '||') as commodities
                  FROM quotations q
                  LEFT JOIN users u ON q.quote_sent_by = u.id
                  LEFT JOIN quotation_commodities qc ON q.id = qc.quotation_id
                  WHERE q.created_by = :user_id
                  GROUP BY q.id
                  ORDER BY q.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        $stmt->execute();
        
        $quotations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($quotations);
        break;

    case 'POST':
        // Create new quotation
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "INSERT INTO quotations 
                  (client_id, client_name, volume, buy_rate, currency, client_quote, profit, 
                   profit_percentage, quote_sent_by, status, follow_up_date, remarks, 
                   destination, door_delivery, freight_mode, cargo_description, request_type, 
                   country_of_origin, total_volume_kg, created_by)
                  VALUES 
                  (:client_id, :client_name, :volume, :buy_rate, :currency, :client_quote, :profit,
                   :profit_percentage, :quote_sent_by, :status, :follow_up_date, :remarks,
                   :destination, :door_delivery, :freight_mode, :cargo_description, :request_type,
                   :country_of_origin, :total_volume_kg, :created_by)";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':client_id', $data->clientId);
        $stmt->bindParam(':client_name', $data->clientName);
        $stmt->bindParam(':volume', $data->volume);
        $stmt->bindParam(':buy_rate', $data->buyRate);
        $stmt->bindParam(':currency', $data->currency);
        $stmt->bindParam(':client_quote', $data->clientQuote);
        $stmt->bindParam(':profit', $data->profit);
        $stmt->bindParam(':profit_percentage', $data->profitPercentage);
        $stmt->bindParam(':quote_sent_by', $_SESSION['user_id']);
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':follow_up_date', $data->followUpDate);
        $stmt->bindParam(':remarks', $data->remarks);
        $stmt->bindParam(':destination', $data->destination);
        $stmt->bindParam(':door_delivery', $data->doorDelivery);
        $stmt->bindParam(':freight_mode', $data->freightMode);
        $stmt->bindParam(':cargo_description', $data->cargoDescription);
        $stmt->bindParam(':request_type', $data->requestType);
        $stmt->bindParam(':country_of_origin', $data->countryOfOrigin);
        $stmt->bindParam(':total_volume_kg', $data->totalVolumeKg);
        $stmt->bindParam(':created_by', $_SESSION['user_id']);
        
        if ($stmt->execute()) {
            $quotation_id = $db->lastInsertId();
            
            // Insert commodities
            if (isset($data->commodities) && is_array($data->commodities)) {
                $commodity_query = "INSERT INTO quotation_commodities 
                                    (quotation_id, name, quantity_kg, rate, client_rate) 
                                    VALUES (:quotation_id, :name, :quantity_kg, :rate, :client_rate)";
                $commodity_stmt = $db->prepare($commodity_query);
                
                foreach ($data->commodities as $commodity) {
                    $commodity_stmt->bindParam(':quotation_id', $quotation_id);
                    $commodity_stmt->bindParam(':name', $commodity->name);
                    $commodity_stmt->bindParam(':quantity_kg', $commodity->quantityKg);
                    $commodity_stmt->bindParam(':rate', $commodity->rate);
                    $commodity_stmt->bindParam(':client_rate', $commodity->clientRate);
                    $commodity_stmt->execute();
                }
            }
            
            http_response_code(201);
            echo json_encode(["message" => "Quotation created", "id" => $quotation_id]);
        } else {
            http_response_code(503);
            echo json_encode(["error" => "Failed to create quotation"]);
        }
        break;

    case 'PUT':
        // Update quotation
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "UPDATE quotations SET 
                  status = :status,
                  remarks = :remarks,
                  approved_by = :approved_by,
                  approved_at = :approved_at
                  WHERE id = :id AND created_by = :user_id";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':remarks', $data->remarks);
        $stmt->bindParam(':approved_by', $data->approvedBy);
        $stmt->bindParam(':approved_at', $data->approvedAt);
        $stmt->bindParam(':id', $data->id);
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "Quotation updated"]);
        } else {
            http_response_code(503);
            echo json_encode(["error" => "Failed to update quotation"]);
        }
        break;

    case 'DELETE':
        // Delete quotation
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            $query = "DELETE FROM quotations WHERE id = :id AND created_by = :user_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':user_id', $_SESSION['user_id']);
            
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "Quotation deleted"]);
            } else {
                http_response_code(503);
                echo json_encode(["error" => "Failed to delete quotation"]);
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
