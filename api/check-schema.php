<?php
require_once '../config/database.php';

try {
    $conn = getDBConnection();
    $result = $conn->query("DESCRIBE Customer");
    $columns = [];
    while ($row = $result->fetch_assoc()) {
        $columns[] = $row;
    }
    header('Content-Type: application/json');
    echo json_encode($columns, JSON_PRETTY_PRINT);
    closeDBConnection($conn);
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
