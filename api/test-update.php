<?php
/**
 * Test Update Profile API
 * Simple test to check if the API is working
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');

// Include database configuration
require_once '../config/database.php';

try {
    // Test database connection
    $conn = getDBConnection();
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'post_data' => $_POST,
        'files_data' => isset($_FILES) ? array_keys($_FILES) : []
    ]);
    closeDBConnection($conn);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
