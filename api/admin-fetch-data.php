<?php
/**
 * Admin Data Fetch API
 * Retrieves all data needed for the admin dashboard (Vehicles, Bookings, Customers)
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config/database.php';

try {
    $conn = getDBConnection();
    
    $response = [
        'success' => true,
        'vehicles' => [],
        'bookings' => [],
        'customers' => [],
        'stats' => []
    ];

    // Fetch Vehicles
    $vehicleQuery = "SELECT * FROM Vehicle ORDER BY VehicleId DESC";
    $vehicleResult = $conn->query($vehicleQuery);
    while ($row = $vehicleResult->fetch_assoc()) {
        $response['vehicles'][] = $row;
    }

    // Fetch Bookings with Customer and Vehicle names
    $bookingQuery = "
        SELECT b.*, c.Name as CustomerName, v.Model as VehicleName 
        FROM Booking b
        JOIN Customer c ON b.Cusid = c.Cusid
        JOIN Vehicle v ON b.VehicleId = v.VehicleId
        ORDER BY b.Booking_date DESC
    ";
    $bookingResult = $conn->query($bookingQuery);
    while ($row = $bookingResult->fetch_assoc()) {
        $response['bookings'][] = $row;
    }

    // Fetch Customers
    $customerQuery = "SELECT Cusid, Name, Email, Ctel, Gender, Created_date FROM Customer ORDER BY Cusid DESC";
    $customerResult = $conn->query($customerQuery);
    while ($row = $customerResult->fetch_assoc()) {
        $response['customers'][] = $row;
    }

    // Stats
    $totalVehicles = $vehicleResult->num_rows;
    $activeBookings = "SELECT COUNT(*) as count FROM Booking WHERE Status = 'Approved'";
    $activeBookingsRes = $conn->query($activeBookings)->fetch_assoc();
    
    $totalRevenue = "SELECT SUM(Total_price) as total FROM Booking WHERE Status = 'Completed' OR Status = 'Approved'";
    $totalRevenueRes = $conn->query($totalRevenue)->fetch_assoc();

    $availableVehicles = "SELECT COUNT(*) as count FROM Vehicle WHERE Available = 1";
    $availableVehiclesRes = $conn->query($availableVehicles)->fetch_assoc();

    $response['stats'] = [
        'totalVehicles' => $totalVehicles,
        'activeBookings' => $activeBookingsRes['count'],
        'totalRevenue' => floatval($totalRevenueRes['total'] ?? 0),
        'availableVehicles' => $availableVehiclesRes['count']
    ];

    echo json_encode($response);
    
    closeDBConnection($conn);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
