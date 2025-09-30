<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

if (isset($_SESSION['user_id'])) {
    http_response_code(200);
    echo json_encode([
        "authenticated" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "name" => $_SESSION['user_name'],
            "email" => $_SESSION['user_email'],
            "role" => $_SESSION['user_role']
        ]
    ]);
} else {
    http_response_code(200);
    echo json_encode([
        "authenticated" => false,
        "user" => null
    ]);
}
?>
