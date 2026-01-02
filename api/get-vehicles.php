<?php
/**
 * Public Vehicle Fetch API
 * Retrieves all available vehicles for the catalog
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config/database.php';

try {
    $conn = getDBConnection();
    
    $query = "SELECT * FROM Vehicle WHERE Available = 1 ORDER BY VehicleId DESC";
    $result = $conn->query($query);
    
    $vehicles = [];
    while ($row = $result->fetch_assoc()) {
        // Add some mock data for rating and features since they aren't in the DB yet
        $row['Rating'] = number_format(4.5 + (rand(0, 5) / 10), 1);
        $row['Transmission'] = 'Automatic'; // Default
        $vehicles[] = $row;
    }

    echo json_encode([
        'success' => true,
        'vehicles' => $vehicles
    ]);
    
    closeDBConnection($conn);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
