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
        // Fetch all clients
        $query = "SELECT * FROM clients ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($clients);
        break;

    case 'POST':
        // Create new client
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "INSERT INTO clients 
                  (company_name, contact_person, tin_number, address, city, country, phone, email) 
                  VALUES 
                  (:company_name, :contact_person, :tin_number, :address, :city, :country, :phone, :email)";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':company_name', $data->companyName);
        $stmt->bindParam(':contact_person', $data->contactPerson);
        $stmt->bindParam(':tin_number', $data->tinNumber);
        $stmt->bindParam(':address', $data->address);
        $stmt->bindParam(':city', $data->city);
        $stmt->bindParam(':country', $data->country);
        $stmt->bindParam(':phone', $data->phone);
        $stmt->bindParam(':email', $data->email);
        
        if ($stmt->execute()) {
            $client_id = $db->lastInsertId();
            http_response_code(201);
            echo json_encode(["message" => "Client created", "id" => $client_id]);
        } else {
            http_response_code(503);
            echo json_encode(["error" => "Failed to create client"]);
        }
        break;

    case 'PUT':
        // Update client
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "UPDATE clients SET 
                  company_name = :company_name,
                  contact_person = :contact_person,
                  tin_number = :tin_number,
                  address = :address,
                  city = :city,
                  country = :country,
                  phone = :phone,
                  email = :email
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':company_name', $data->companyName);
        $stmt->bindParam(':contact_person', $data->contactPerson);
        $stmt->bindParam(':tin_number', $data->tinNumber);
        $stmt->bindParam(':address', $data->address);
        $stmt->bindParam(':city', $data->city);
        $stmt->bindParam(':country', $data->country);
        $stmt->bindParam(':phone', $data->phone);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':id', $data->id);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "Client updated"]);
        } else {
            http_response_code(503);
            echo json_encode(["error" => "Failed to update client"]);
        }
        break;

    case 'DELETE':
        // Delete client
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            $query = "DELETE FROM clients WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "Client deleted"]);
            } else {
                http_response_code(503);
                echo json_encode(["error" => "Failed to delete client"]);
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
