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

if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized - Admin access required"]);
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
        // Fetch all users
        $query = "SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($users);
        break;

    case 'POST':
        // Create new user
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->email) || empty($data->password)) {
            http_response_code(400);
            echo json_encode(["error" => "Email and password are required"]);
            exit();
        }
        
        $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
        
        $query = "INSERT INTO users (name, email, password, role, status) 
                  VALUES (:name, :email, :password, :role, :status)";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':password', $hashed_password);
        $stmt->bindParam(':role', $data->role);
        $status = $data->status ?? 'active';
        $stmt->bindParam(':status', $status);
        
        if ($stmt->execute()) {
            $user_id = $db->lastInsertId();
            http_response_code(201);
            echo json_encode(["message" => "User created", "id" => $user_id]);
        } else {
            http_response_code(503);
            echo json_encode(["error" => "Failed to create user"]);
        }
        break;

    case 'PUT':
        // Update user
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "UPDATE users SET 
                  name = :name,
                  email = :email,
                  role = :role,
                  status = :status
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':role', $data->role);
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':id', $data->id);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "User updated"]);
        } else {
            http_response_code(503);
            echo json_encode(["error" => "Failed to update user"]);
        }
        break;

    case 'DELETE':
        // Delete user
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            $query = "DELETE FROM users WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "User deleted"]);
            } else {
                http_response_code(503);
                echo json_encode(["error" => "Failed to delete user"]);
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
