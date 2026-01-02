<?php
/**
 * Admin Login API
 * Authenticates administrators against the Admin table in the database
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database configuration
require_once '../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get database connection
    $conn = getDBConnection();

    // Get POST data
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';

    // Validate inputs
    if (empty($email) || empty($password)) {
        throw new Exception('Email and password are required');
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Prepare SQL statement to fetch admin by email
    $stmt = $conn->prepare("SELECT AdminId, Name, Email, Password FROM Admin WHERE Email = ? LIMIT 1");
    
    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . $conn->error);
    }

    // Bind parameters
    $stmt->bind_param("s", $email);
    
    // Execute the statement
    $stmt->execute();

    // Get result
    $result = $stmt->get_result();

    // Check if admin exists
    if ($result->num_rows === 0) {
        $stmt->close();
        closeDBConnection($conn);
        throw new Exception('Invalid email or password');
    }

    // Fetch admin data
    $admin = $result->fetch_assoc();

    // Verify password
    if (!password_verify($password, $admin['Password'])) {
        $stmt->close();
        closeDBConnection($conn);
        throw new Exception('Invalid email or password');
    }

    // Login successful - return admin data (excluding password)
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'admin' => [
            'adminId' => $admin['AdminId'],
            'name' => $admin['Name'],
            'email' => $admin['Email']
        ]
    ]);

    // Close statement
    $stmt->close();
    
    // Close connection
    closeDBConnection($conn);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    
    if (isset($conn)) {
        closeDBConnection($conn);
    }
}
?>
