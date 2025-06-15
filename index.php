
<?php
session_start();

// Redirect to appropriate dashboard if logged in
if (isset($_SESSION['user_id']) && isset($_SESSION['user_role'])) {
    switch($_SESSION['user_role']) {
        case 'admin':
            header('Location: admin/index.php');
            break;
        case 'sales_director':
            header('Location: sales_director/index.php');
            break;
        case 'sales_agent':
            header('Location: sales_agent/index.php');
            break;
        case 'finance_officer':
            header('Location: finance/index.php');
            break;
        default:
            // If role is unknown, redirect to login
            header('Location: auth/login.php');
    }
    exit();
}

// Redirect to login if not logged in
header('Location: auth/login.php');
exit();
?>
