<?php
/**
 * Update Profile API
 * Handles customer profile updates and stores data in the database
 */

// Enable error reporting for debugging (to log only)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set headers for JSON response and CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST/PUT requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Only POST/PUT requests are accepted.'
    ]);
    exit();
}

// Include database configuration
require_once '../config/database.php';

try {
    // Get database connection
    $conn = getDBConnection();
    
    // Get form data
    $customerId = isset($_POST['customerId']) ? intval($_POST['customerId']) : 0;
    $firstName = isset($_POST['firstName']) ? trim($_POST['firstName']) : '';
    $lastName = isset($_POST['lastName']) ? trim($_POST['lastName']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    $address = isset($_POST['address']) ? trim($_POST['address']) : '';
    $dateOfBirth = isset($_POST['dateOfBirth']) ? trim($_POST['dateOfBirth']) : '';
    $gender = isset($_POST['gender']) ? trim($_POST['gender']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';
    
    // Log received data for debugging
    error_log("Update Profile Request - Customer ID: $customerId, Email: $email, Name: $firstName $lastName");
    
    // Validate customer ID
    if ($customerId <= 0) {
        throw new Exception('Invalid customer ID. Please log in again.');
    }
    
    // Validate required fields (phone and password are optional)
    if (empty($firstName) || empty($lastName) || empty($email) || 
        empty($address) || empty($dateOfBirth) || empty($gender)) {
        throw new Exception('Please fill in all required fields (First Name, Last Name, Email, Address, Date of Birth, Gender).');
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Please enter a valid email address.');
    }
    
    // Check if customer exists
    $checkStmt = $conn->prepare("SELECT Cusid FROM Customer WHERE Cusid = ?");
    if (!$checkStmt) {
        throw new Exception('Database error: ' . $conn->error);
    }
    $checkStmt->bind_param("i", $customerId);
    $checkStmt->execute();
    $checkStmt->store_result();
    
    if ($checkStmt->num_rows === 0) {
        $checkStmt->close();
        throw new Exception('Customer account not found. Please log in again.');
    }
    $checkStmt->close();
    
    // Check if email is already used by another customer
    $emailCheckStmt = $conn->prepare("SELECT Cusid FROM Customer WHERE Email = ? AND Cusid != ?");
    if (!$emailCheckStmt) {
        throw new Exception('Database error: ' . $conn->error);
    }
    $emailCheckStmt->bind_param("si", $email, $customerId);
    $emailCheckStmt->execute();
    $emailCheckStmt->store_result();
    
    if ($emailCheckStmt->num_rows > 0) {
        $emailCheckStmt->close();
        throw new Exception('This email is already registered to another account.');
    }
    $emailCheckStmt->close();
    
    // Handle profile photo upload
    $imagePath = null;
    $updateImage = false;
    
    if (isset($_FILES['profilePhoto']) && $_FILES['profilePhoto']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/profiles/';
        
        // Create directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                throw new Exception('Failed to create upload directory.');
            }
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
        $fileName = 'profile_' . $customerId . '_' . time() . '.' . $fileExtension;
        $targetPath = $uploadDir . $fileName;
        
        // Move uploaded file
        if (move_uploaded_file($_FILES['profilePhoto']['tmp_name'], $targetPath)) {
            $imagePath = 'uploads/profiles/' . $fileName;
            $updateImage = true;
        } else {
            throw new Exception('Failed to upload profile photo.');
        }
    }
    
    // Combine first and last name
    $fullName = $firstName . ' ' . $lastName;
    
    // Prepare SQL statement based on what needs to be updated
    if (!empty($password)) {
        // Validate password length
        if (strlen($password) < 6) {
            throw new Exception('Password must be at least 6 characters long.');
        }
        
        // Hash the password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        if ($updateImage) {
            // Update with password and image
            $stmt = $conn->prepare("UPDATE Customer SET Name = ?, Email = ?, Password = ?, Ctel = ?, Caddress = ?, Cdob = ?, Gender = ?, Image = ? WHERE Cusid = ?");
            $stmt->bind_param("ssssssssi", $fullName, $email, $hashedPassword, $phone, $address, $dateOfBirth, $gender, $imagePath, $customerId);
        } else {
            // Update with password only
            $stmt = $conn->prepare("UPDATE Customer SET Name = ?, Email = ?, Password = ?, Ctel = ?, Caddress = ?, Cdob = ?, Gender = ? WHERE Cusid = ?");
            $stmt->bind_param("sssssssi", $fullName, $email, $hashedPassword, $phone, $address, $dateOfBirth, $gender, $customerId);
        }
    } else {
        if ($updateImage) {
            // Update with image only
            $stmt = $conn->prepare("UPDATE Customer SET Name = ?, Email = ?, Ctel = ?, Caddress = ?, Cdob = ?, Gender = ?, Image = ? WHERE Cusid = ?");
            $stmt->bind_param("sssssssi", $fullName, $email, $phone, $address, $dateOfBirth, $gender, $imagePath, $customerId);
        } else {
            // Update without password and image
            $stmt = $conn->prepare("UPDATE Customer SET Name = ?, Email = ?, Ctel = ?, Caddress = ?, Cdob = ?, Gender = ? WHERE Cusid = ?");
            $stmt->bind_param("ssssssi", $fullName, $email, $phone, $address, $dateOfBirth, $gender, $customerId);
        }
    }
    
    if (!$stmt) {
        throw new Exception('Failed to prepare update statement: ' . $conn->error);
    }
    
    // Execute the statement
    if ($stmt->execute()) {
        // Get updated customer data
        $getStmt = $conn->prepare("SELECT Cusid, Name, Email, Ctel, Caddress, Cdob, Gender, Image FROM Customer WHERE Cusid = ?");
        $getStmt->bind_param("i", $customerId);
        $getStmt->execute();
        $result = $getStmt->get_result();
        $customer = $result->fetch_assoc();
        $getStmt->close();
        
        // Success response
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully!',
            'customer' => [
                'id' => $customer['Cusid'],
                'name' => $customer['Name'],
                'email' => $customer['Email'],
                'phone' => $customer['Ctel'],
                'address' => $customer['Caddress'],
                'dateOfBirth' => $customer['Cdob'],
                'gender' => $customer['Gender'],
                'image' => $customer['Image']
            ]
        ]);
        
        error_log("Profile updated successfully for customer ID: $customerId");
    } else {
        throw new Exception('Failed to update profile: ' . $stmt->error);
    }
    
    // Close statement
    $stmt->close();
    
    // Close connection
    closeDBConnection($conn);
    
} catch (Exception $e) {
    // Log error for debugging
    error_log("Update Profile Error: " . $e->getMessage());
    
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
