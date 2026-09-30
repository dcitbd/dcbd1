<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_file = __DIR__ . '/../assets/js/db.json';
$data = file_exists($db_file) ? json_decode(file_get_contents($db_file), true) : [];

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['subAction'] ?? '';

if ($action === 'updateStatus') {
    echo json_encode(['status' => 'success', 'message' => 'Updated successfully']);
    exit();
}

echo json_encode(['status' => 'success', 'data' => $data]);
