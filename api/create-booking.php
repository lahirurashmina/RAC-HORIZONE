<?php
/**
 * Create Booking API Endpoint
 * Handles booking creation and saves to database
 */

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set headers for JSON response and CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
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
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validate JSON
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data');
    }

    // Extract and validate required fields
    $startDate = isset($data['start_date']) ? trim($data['start_date']) : null;
    $endDate = isset($data['end_date']) ? trim($data['end_date']) : null;
    $totalPrice = isset($data['total_price']) ? floatval($data['total_price']) : null;
    $status = isset($data['status']) ? trim($data['status']) : 'Pending';
    $customerId = isset($data['customer_id']) ? intval($data['customer_id']) : null;
    $vehicleId = isset($data['vehicle_id']) ? intval($data['vehicle_id']) : 1; // Default to vehicle ID 1 (BMW 5 Series)

    // Validate required fields
    if (empty($startDate)) {
        throw new Exception('Start date is required');
    }

    if (empty($endDate)) {
        throw new Exception('End date is required');
    }

    if ($totalPrice === null || $totalPrice <= 0) {
        throw new Exception('Valid total price is required');
    }

    if (empty($customerId)) {
        throw new Exception('Customer ID is required. Please login first.');
    }

    // Validate status
    $validStatuses = ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];
    if (!in_array($status, $validStatuses)) {
        $status = 'Pending'; // Default to Pending if invalid
    }

    // Validate dates
    $start = new DateTime($startDate);
    $end = new DateTime($endDate);
    
    if ($end <= $start) {
        throw new Exception('End date must be after start date');
    }

    // Get database connection
    $conn = getDBConnection();

    // Prepare SQL statement
    $sql = "INSERT INTO Booking (Start_date, End_date, Total_price, Status, Booking_date, Cusid, VehicleId) 
            VALUES (?, ?, ?, ?, NOW(), ?, ?)";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . $conn->error);
    }

    // Bind parameters
    $stmt->bind_param(
        "ssdsii",
        $startDate,
        $endDate,
        $totalPrice,
        $status,
        $customerId,
        $vehicleId
    );

    // Execute the statement
    if ($stmt->execute()) {
        $bookingId = $stmt->insert_id;

        // Get the created booking details
        $selectSql = "SELECT Bookid, Start_date, End_date, Total_price, Status, 
                             DATE_FORMAT(Booking_date, '%Y-%m-%d %H:%i:%s') as Booking_date,
                             Cusid, VehicleId 
                      FROM Booking 
                      WHERE Bookid = ?";
        
        $selectStmt = $conn->prepare($selectSql);
        $selectStmt->bind_param("i", $bookingId);
        $selectStmt->execute();
        $result = $selectStmt->get_result();
        $booking = $result->fetch_assoc();

        // Close statements
        $selectStmt->close();
        $stmt->close();
        closeDBConnection($conn);

        // Return success response
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Booking created successfully',
            'booking' => $booking
        ]);

    } else {
        throw new Exception('Failed to create booking: ' . $stmt->error);
    }

} catch (Exception $e) {
    // Handle errors
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);

    // Close connection if open
    if (isset($conn)) {
        closeDBConnection($conn);
    }
}
?>
