<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_file = __DIR__ . '/../assets/js/db.json';
$data = file_exists($db_file) ? json_decode(file_get_contents($db_file), true) : [];

$action = $_GET['action'] ?? $_POST['action'] ?? 'getAll';

switch ($action) {
    case 'getProducts':
        echo json_encode(['status' => 'success', 'data' => $data['products'] ?? []]);
        break;
    case 'getCategories':
        echo json_encode(['status' => 'success', 'data' => $data['categories'] ?? []]);
        break;
    case 'getBrands':
        echo json_encode(['status' => 'success', 'data' => $data['brands'] ?? []]);
        break;
    case 'getSettings':
        echo json_encode(['status' => 'success', 'data' => $data['settings'] ?? []]);
        break;
    case 'createOrder':
        $input = json_decode(file_get_contents('php://input'), true);
        $order = $input['data'] ?? [];
        $order['OrderID'] = 'DCBD-' . rand(100000, 999999);
        $order['Date'] = date('Y-m-d H:i:s');
        $order['Order_Status'] = 'Pending';
        $data['orders'][] = $order;
        file_put_contents($db_file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        // Mail notification
        $to = "jainal.dcitbd@gmail.com";
        $subject = "New Order Placed: " . $order['OrderID'];
        $message = "Order ID: {$order['OrderID']}\nCustomer: {$order['Customer_Name']}\nPhone: {$order['Phone']}\nAmount: {$order['Total_Amount']}";
        @mail($to, $subject, $message, "From: no-reply@dreamcartbd.com");
        
        echo json_encode(['status' => 'success', 'orderId' => $order['OrderID'], 'order' => $order]);
        break;
    case 'getAll':
    default:
        echo json_encode(['status' => 'success', 'data' => $data]);
        break;
}
