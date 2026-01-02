<?php
/**
 * User Login API
 * Authenticates registered customers against the database
 */

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for JSON response and CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Only POST requests are accepted.'
    ]);
    exit();
}

// Include database configuration
require_once '../config/database.php';

try {
    // Get database connection
    $conn = getDBConnection();
    
    // Get form data
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    
    // Validate required fields
    if (empty($email) || empty($password)) {
        throw new Exception('Email and password are required.');
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format.');
    }
    
    // Prepare SQL statement to get user by email
    $stmt = $conn->prepare("SELECT Cusid, Name, Email, Password, Ctel, Caddress, Cdob, Gender, Image, Created_date FROM Customer WHERE Email = ?");
    
    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . $conn->error);
    }
    
    // Bind parameters
    $stmt->bind_param("s", $email);
    
    // Execute the statement
    $stmt->execute();
    
    // Get result
    $result = $stmt->get_result();
    
    // Check if user exists
    if ($result->num_rows === 0) {
        $stmt->close();
        closeDBConnection($conn);
        
        // Don't reveal whether email exists or not for security
        throw new Exception('Invalid email or password.');
    }
    
    // Fetch user data
    $user = $result->fetch_assoc();
    
    // Verify password
    if (!password_verify($password, $user['Password'])) {
        $stmt->close();
        closeDBConnection($conn);
        
        throw new Exception('Invalid email or password.');
    }
    
    // Password is correct, prepare user data (exclude password)
    $userData = [
        'customerId' => $user['Cusid'],
        'name' => $user['Name'],
        'email' => $user['Email'],
        'phone' => $user['Ctel'],
        'address' => $user['Caddress'],
        'dateOfBirth' => $user['Cdob'],
        'gender' => $user['Gender'],
        'image' => $user['Image'],
        'createdDate' => $user['Created_date']
    ];
    
    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Login successful!',
        'user' => $userData
    ]);
    
    // Close statement
    $stmt->close();
    
    // Close connection
    closeDBConnection($conn);
    
} catch (Exception $e) {
    // Error response
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    
    // Close connection if it exists
    if (isset($conn)) {
        closeDBConnection($conn);
    }
}
?>
