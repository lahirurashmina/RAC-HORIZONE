<?php
/**
 * Admin Vehicle Management API
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
        $model = $_POST['model'] ?? '';
        $type = $_POST['type'] ?? '';
        $price = $_POST['price'] ?? '';
        $capacity = $_POST['capacity'] ?? '';
        $adminId = $_POST['adminId'] ?? 1;
        
        $imagePath = 'images/default-car.jpg'; // Default image

        // Handle Image Upload
        if (isset($_FILES['v_image']) && $_FILES['v_image']['error'] === 0) {
            $targetDir = "../images/";
            if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);
            
            $fileName = time() . "_" . basename($_FILES["v_image"]["name"]);
            $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $allowedTypes = array('jpg', 'png', 'jpeg', 'gif', 'webp');
            
            if (in_array($fileType, $allowedTypes)) {
                $targetFilePath = $targetDir . $fileName;
                if (move_uploaded_file($_FILES["v_image"]["tmp_name"], $targetFilePath)) {
                    $imagePath = "images/" . $fileName;
                }
            }
        }

        $stmt = $conn->prepare("INSERT INTO Vehicle (Model, Type, Price_per_day, Capacity, Vimage, AdminId) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssdisi", $model, $type, $price, $capacity, $imagePath, $adminId);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Vehicle added successfully']);
        } else {
            throw new Exception($stmt->error);
        }
    } 
    elseif ($action === 'update' || $action === 'edit') {
        $id = $_POST['vehicleId'] ?? '';
        $model = $_POST['model'] ?? '';
        $type = $_POST['type'] ?? '';
        $price = $_POST['price'] ?? '';
        $capacity = $_POST['capacity'] ?? '';
        $available = isset($_POST['available']) ? ($_POST['available'] == '1' ? 1 : 0) : 1;

        // Check if new image uploaded
        if (isset($_FILES['v_image']) && $_FILES['v_image']['error'] === 0) {
            $targetDir = "../images/";
            $fileName = time() . "_" . basename($_FILES["v_image"]["name"]);
            $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $allowedTypes = array('jpg', 'png', 'jpeg', 'gif', 'webp');

            if (in_array($fileType, $allowedTypes)) {
                $targetFilePath = $targetDir . $fileName;
                if (move_uploaded_file($_FILES["v_image"]["tmp_name"], $targetFilePath)) {
                    $imagePath = "images/" . $fileName;
                    $stmt = $conn->prepare("UPDATE Vehicle SET Model=?, Type=?, Price_per_day=?, Capacity=?, Available=?, Vimage=? WHERE VehicleId=?");
                    $stmt->bind_param("ssdiisi", $model, $type, $price, $capacity, $available, $imagePath, $id);
                } else {
                    $stmt = $conn->prepare("UPDATE Vehicle SET Model=?, Type=?, Price_per_day=?, Capacity=?, Available=? WHERE VehicleId=?");
                    $stmt->bind_param("ssdiii", $model, $type, $price, $capacity, $available, $id);
                }
            } else {
                $stmt = $conn->prepare("UPDATE Vehicle SET Model=?, Type=?, Price_per_day=?, Capacity=?, Available=? WHERE VehicleId=?");
                $stmt->bind_param("ssdiii", $model, $type, $price, $capacity, $available, $id);
            }
        } else {
            $stmt = $conn->prepare("UPDATE Vehicle SET Model=?, Type=?, Price_per_day=?, Capacity=?, Available=? WHERE VehicleId=?");
            $stmt->bind_param("ssdiii", $model, $type, $price, $capacity, $available, $id);
        }
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Vehicle updated successfully']);
        } else {
            throw new Exception($stmt->error);
        }
    } 
    elseif ($action === 'delete') {
        $id = $_POST['vehicleId'] ?? '';
        
        $stmt = $conn->prepare("DELETE FROM Vehicle WHERE VehicleId=?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Vehicle deleted successfully']);
        } else {
            throw new Exception("Cannot delete vehicle. It may be linked to existing bookings.");
        }
    } else {
        throw new Exception('Invalid action');
    }

    closeDBConnection($conn);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
