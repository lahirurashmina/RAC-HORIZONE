<?php
/**
 * Public Vehicle Details Fetch API
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config/database.php';

try {
    $conn = getDBConnection();
    $id = $_GET['id'] ?? '';

    if (!$id) {
        throw new Exception('Vehicle ID is required');
    }

    $stmt = $conn->prepare("SELECT * FROM Vehicle WHERE VehicleId = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        // Add mock details for missing DB fields to keep UI rich
        $row['Rating'] = 4.8;
        $row['Transmission'] = 'Automatic';
        $row['Description'] = 'This premium vehicle is part of our standard fleet, offering excellent comfort and performance for your travel needs. It has been thoroughly inspected and is ready for your next journey.';
        $row['Specs'] = [
            'engine' => '2.0L 4-Cylinder',
            'fuel' => 'Petrol',
            'mileage' => '28 MPG',
            'luggage' => '2 Large Bags'
        ];
        $row['Features'] = ['Bluetooth', 'Air Conditioning', 'Backup Camera', 'USB Port'];

        echo json_encode(['success' => true, 'car' => $row]);
    } else {
        throw new Exception('Vehicle not found');
    }

    closeDBConnection($conn);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
