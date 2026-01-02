<?php
/**
 * Admin Booking Management API
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

    if ($action === 'status') {
        $id = $_POST['bookid'] ?? '';
        $status = $_POST['status'] ?? '';
        $adminId = $_POST['adminId'] ?? 1; // Default to 1 if not provided

        $conn->begin_transaction();

        try {
            $stmt = $conn->prepare("UPDATE Booking SET Status=? WHERE Bookid=?");
            $stmt->bind_param("si", $status, $id);
            $stmt->execute();

            if ($status === 'Approved') {
                // Also insert into Admin_Approves_Booking
                $stmt2 = $conn->prepare("REPLACE INTO Admin_Approves_Booking (AdminId, Bookid) VALUES (?, ?)");
                $stmt2->bind_param("ii", $adminId, $id);
                $stmt2->execute();
            }

            $conn->commit();
            echo json_encode(['success' => true, 'message' => "Booking $status successfully"]);
        } catch (Exception $e) {
            $conn->rollback();
            throw $e;
        }
    } 
    elseif ($action === 'delete') {
        $id = $_POST['bookid'] ?? '';
        
        $stmt = $conn->prepare("DELETE FROM Booking WHERE Bookid=?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Booking deleted successfully']);
        } else {
            throw new Exception($stmt->error);
        }
    } else {
        throw new Exception('Invalid action');
    }

    closeDBConnection($conn);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
