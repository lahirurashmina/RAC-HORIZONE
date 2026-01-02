<?php
/**
 * Admin Customer Management API
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once '../config/database.php';

try {
    $conn = getDBConnection();
    $action = $_POST['action'] ?? '';

    if ($action === 'add') {
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $password = password_hash($_POST['password'] ?? 'password123', PASSWORD_DEFAULT);
        $phone = $_POST['phone'] ?? '';
        $gender = $_POST['gender'] ?? 'Other';

        $stmt = $conn->prepare("INSERT INTO Customer (Name, Email, Password, Ctel, Gender) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $name, $email, $password, $phone, $gender);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Customer added successfully']);
        } else {
            throw new Exception($stmt->error);
        }
    } 
    elseif ($action === 'delete') {
        $id = $_POST['cusid'] ?? '';
        
        $stmt = $conn->prepare("DELETE FROM Customer WHERE Cusid=?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Customer deleted successfully']);
        } else {
            throw new Exception("Cannot delete customer. They may have active bookings.");
        }
    } else {
        throw new Exception('Invalid action');
    }

    closeDBConnection($conn);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
