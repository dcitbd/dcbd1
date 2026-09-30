<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $target_dir = __DIR__ . "/../assets/uploads/products/";
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    $target_file = $target_dir . basename($_FILES["file"]["name"]);
    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        echo json_encode(['status' => 'success', 'url' => 'assets/uploads/products/' . basename($_FILES["file"]["name"])]);
        exit();
    }
}

echo json_encode(['status' => 'error', 'message' => 'Upload failed or no file specified']);
