<?php
/**
 * User Signup API
 * Handles user registration and stores data in the database
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
    $firstName = isset($_POST['firstName']) ? trim($_POST['firstName']) : '';
    $lastName = isset($_POST['lastName']) ? trim($_POST['lastName']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $address = isset($_POST['address']) ? trim($_POST['address']) : '';
    $dateOfBirth = isset($_POST['dateOfBirth']) ? trim($_POST['dateOfBirth']) : '';
    $gender = isset($_POST['gender']) ? trim($_POST['gender']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $createdDate = isset($_POST['createdDate']) ? trim($_POST['createdDate']) : date('Y-m-d');
    
    // Validate required fields
    if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || 
        empty($address) || empty($dateOfBirth) || empty($gender) || empty($password)) {
        throw new Exception('All fields are required.');
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format.');
    }
    
    // Validate password length
    if (strlen($password) < 6) {
        throw new Exception('Password must be at least 6 characters long.');
    }
    
    // Validate age (must be at least 18)
    $dob = new DateTime($dateOfBirth);
    $today = new DateTime();
    $age = $today->diff($dob)->y;
    if ($age < 18) {
        throw new Exception('You must be at least 18 years old to register.');
    }
    
    // Check if email already exists
    $checkEmailStmt = $conn->prepare("SELECT Cusid FROM Customer WHERE Email = ?");
    $checkEmailStmt->bind_param("s", $email);
    $checkEmailStmt->execute();
    $checkEmailStmt->store_result();
    
    if ($checkEmailStmt->num_rows > 0) {
        $checkEmailStmt->close();
        throw new Exception('Email already exists. Please use a different email or login.');
    }
    $checkEmailStmt->close();
    
    // Handle profile photo upload
    $imagePath = null;
    if (isset($_FILES['profilePhoto']) && $_FILES['profilePhoto']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/profiles/';
        
        // Create directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $fileExtension = strtolower(pathinfo($_FILES['profilePhoto']['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        // Validate file extension
        if (!in_array($fileExtension, $allowedExtensions)) {
            throw new Exception('Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed.');
        }
        
        // Validate file size (max 5MB)
        if ($_FILES['profilePhoto']['size'] > 5 * 1024 * 1024) {
            throw new Exception('File size must be less than 5MB.');
        }
        
        // Generate unique filename
        $fileName = 'profile_' . uniqid() . '_' . time() . '.' . $fileExtension;
        $targetPath = $uploadDir . $fileName;
        
        // Move uploaded file
        if (move_uploaded_file($_FILES['profilePhoto']['tmp_name'], $targetPath)) {
            $imagePath = 'uploads/profiles/' . $fileName;
        } else {
            throw new Exception('Failed to upload profile photo.');
        }
    }
    
    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Combine first and last name
    $fullName = $firstName . ' ' . $lastName;
    
    // Prepare SQL statement
    $stmt = $conn->prepare("INSERT INTO Customer (Name, Email, Password, Ctel, Caddress, Cdob, Gender, Image, Created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . $conn->error);
    }
    
    // Bind parameters
    $stmt->bind_param("sssssssss", $fullName, $email, $hashedPassword, $phone, $address, $dateOfBirth, $gender, $imagePath, $createdDate);
    
    // Execute the statement
    if ($stmt->execute()) {
        $customerId = $stmt->insert_id;
        
        // Success response
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful! You can now login.',
            'customerId' => $customerId,
            'email' => $email
        ]);
    } else {
        throw new Exception('Registration failed: ' . $stmt->error);
    }
    
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
