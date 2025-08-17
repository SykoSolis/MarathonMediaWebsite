<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$messagesFile = 'messages.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Save new message
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        exit;
    }
    
    // Create new message object
    $newMessage = [
        'id' => time() . rand(1000, 9999),
        'name' => $input['name'] ?? '',
        'email' => $input['email'] ?? '',
        'company' => $input['company'] ?? '',
        'website' => $input['website'] ?? '',
        'services' => $input['services'] ?? [],
        'budget' => $input['budget'] ?? '',
        'timeline' => $input['timeline'] ?? '',
        'message' => $input['message'] ?? '',
        'timestamp' => date('c'),
        'status' => 'unread',
        'replies' => []
    ];
    
    // Read existing messages
    $messages = [];
    if (file_exists($messagesFile)) {
        $content = file_get_contents($messagesFile);
        $messages = json_decode($content, true) ?: [];
    }
    
    // Add new message to the beginning
    array_unshift($messages, $newMessage);
    
    // Save back to file
    if (file_put_contents($messagesFile, json_encode($messages, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Message saved successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save message']);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Load messages
    if (file_exists($messagesFile)) {
        $content = file_get_contents($messagesFile);
        $messages = json_decode($content, true) ?: [];
        echo json_encode($messages);
    } else {
        echo json_encode([]);
    }
}
?>