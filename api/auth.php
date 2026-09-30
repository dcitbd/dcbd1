<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$type = $input['accountType'] ?? 'customer';
$user = $input['username'] ?? '';
$pass = $input['password'] ?? '';

$db_file = __DIR__ . '/../assets/js/db.json';
$data = file_exists($db_file) ? json_decode(file_get_contents($db_file), true) : [];

if (isset($data['users'][$type])) {
    $record = $data['users'][$type];
    $storedUser = $record['User_ID'] ?? $record['User_Name'] ?? $record['Mobile'] ?? '';
    $storedPass = $record['Password'] ?? '';
    
    if (($storedUser === $user || ($record['Mobile'] ?? '') === $user) && $storedPass === $pass) {
        unset($record['Password']);
        $record['Account_Type'] = $type;
        echo json_encode(['status' => 'success', 'user' => $record]);
        exit();
    }
}

echo json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
