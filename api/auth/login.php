<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(503);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $query = "SELECT id, name, email, password, role, status FROM users WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (password_verify($data->password, $row['password'])) {
            if ($row['status'] === 'active') {
                $_SESSION['user_id'] = $row['id'];
                $_SESSION['user_email'] = $row['email'];
                $_SESSION['user_name'] = $row['name'];
                $_SESSION['user_role'] = $row['role'];

                http_response_code(200);
                echo json_encode([
                    "message" => "Login successful",
                    "user" => [
                        "id" => $row['id'],
                        "name" => $row['name'],
                        "email" => $row['email'],
                        "role" => $row['role'],
                        "status" => $row['status']
                    ],
                    "session_id" => session_id()
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["error" => "Account is inactive"]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid credentials"]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["error" => "User not found"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required"]);
}
?>
